Java.perform(function () {
    console.log("[*] Starting root and emulator bypass script...");

    // SSL Pinning Bypass
    var array_list = Java.use("java.util.ArrayList");
    var ApiClient = Java.use('com.android.org.conscrypt.TrustManagerImpl');

    ApiClient.checkTrustedRecursive.implementation = function (a1, a2, a3, a4, a5, a6) {
        console.log("[*] Bypassing SSL Pinning");
        return array_list.$new();
    };

    // Root Detection Bypasses
    var RootPackages = [
        "com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
        "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su",
        "com.koushikdutta.rommanager", "com.koushikdutta.rommanager.license",
        "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch", "com.ramdroid.appquarantine",
        "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
        "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb",
        "com.amphoras.hidemyroot", "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium",
        "com.formyhm.hideroot", "me.phh.superuser", "eu.chainfire.supersu.pro",
        "com.kingouser.com", "com.android.vending.billing.InAppBillingService.COIN",
        "com.topjohnwu.magisk", "com.sparktech.appinventer"
    ];

    var RootBinaries = [
        "su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk",
        "magisk", "magiskinit", "magiskpolicy", "xposed", "frida", "frida-server"
    ];

    var RootProperties = {
        "ro.build.selinux": "1",
        "ro.debuggable": "0",
        "service.adb.root": "0",
        "ro.secure": "1",
        "ro.build.type": "user",
        "ro.build.tags": "release-keys",
        "ro.product.model": "Pixel 5",
        "ro.hardware": "qcom",
        "ro.build.fingerprint": "google/redfin/redfin:11/RQ3A.210805.001.A1/7474174:user/release-keys"
    };

    var RootPropertiesKeys = Object.keys(RootProperties);

    var PackageManager = Java.use("android.app.ApplicationPackageManager");
    var Runtime = Java.use('java.lang.Runtime');
    var NativeFile = Java.use('java.io.File');
    var String = Java.use('java.lang.String');
    var SystemProperties = Java.use('android.os.SystemProperties');
    var BufferedReader = Java.use('java.io.BufferedReader');
    var ProcessBuilder = Java.use('java.lang.ProcessBuilder');

    // Log loaded classes
    var loaded_classes = Java.enumerateLoadedClassesSync();
    console.log("[*] Loaded " + loaded_classes.length + " classes!");

    // PackageManager Hook
    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function (pname, flags) {
        if (RootPackages.indexOf(pname) > -1) {
            console.log("[*] Bypassing root package: " + pname);
            pname = "com.android.fake.package";
        }
        return this.getPackageInfo.call(this, pname, flags);
    };

    // File Existence Hook
    NativeFile.exists.implementation = function () {
        var name = NativeFile.getName.call(this);
        if (RootBinaries.indexOf(name) > -1) {
            console.log("[*] Bypassing file existence: " + name);
            return false;
        }
        return this.exists.call(this);
    };

    // Runtime.exec Hooks
    var execMethods = [
        Runtime.exec.overload('[Ljava.lang.String;'),
        Runtime.exec.overload('java.lang.String'),
        Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;'),
        Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;'),
        Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File'),
        Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;', 'java.io.File')
    ];

    execMethods.forEach(function (method) {
        method.implementation = function () {
            var cmd = arguments[0];
            if (typeof cmd === 'string') {
                if (cmd.includes("getprop") || cmd.includes("mount") || cmd.includes("build.prop") || cmd === "id" || cmd === "sh" || cmd === "su" || cmd === "which") {
                    console.log("[*] Bypassing command: " + cmd);
                    return Runtime.exec.overload('java.lang.String').call(this, "grep");
                }
            } else if (Array.isArray(cmd)) {
                for (var i = 0; i < cmd.length; i++) {
                    if (cmd[i].includes("getprop") || cmd[i].includes("mount") || cmd[i].includes("build.prop") || cmd[i] === "id" || cmd[i] === "sh" || cmd[i] === "su" || cmd[i] === "which") {
                        console.log("[*] Bypassing command array: " + cmd[i]);
                        return Runtime.exec.overload('java.lang.String').call(this, "grep");
                    }
                }
            }
            return method.apply(this, arguments);
        };
    });

    // SystemProperties Hook
    SystemProperties.get.overload('java.lang.String').implementation = function (name) {
        if (RootPropertiesKeys.indexOf(name) > -1) {
            console.log("[*] Bypassing property: " + name + " -> " + RootProperties[name]);
            return RootProperties[name];
        }
        return this.get.call(this, name);
    };

    // String.contains Hook
    String.contains.implementation = function (name) {
        if (name === "test-keys") {
            console.log("[*] Bypassing test-keys check");
            return false;
        }
        return this.contains.call(this, name);
    };

    // BufferedReader Hook
    BufferedReader.readLine.overload().implementation = function () {
        var text = this.readLine.call(this);
        if (text && text.includes("ro.build.tags=test-keys")) {
            console.log("[*] Bypassing build.prop read");
            return text.replace("ro.build.tags=test-keys", "ro.build.tags=release-keys");
        }
        return text;
    };

    // ProcessBuilder Hook
    ProcessBuilder.start.implementation = function () {
        var cmd = this.command.call(this);
        for (var i = 0; i < cmd.size(); i++) {
            var tmp_cmd = cmd.get(i).toString();
            if (tmp_cmd.includes("getprop") || tmp_cmd.includes("mount") || tmp_cmd.includes("build.prop") || tmp_cmd.includes("id") || tmp_cmd.includes("su")) {
                console.log("[*] Bypassing ProcessBuilder: " + tmp_cmd);
                this.command.call(this, ["grep"]);
                return this.start.call(this);
            }
        }
        return this.start.call(this);
    };

    // Native Hooks
    Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
        onEnter: function (args) {
            var path = Memory.readCString(args[0]);
            if (RootBinaries.some(binary => path.includes(binary))) {
                console.log("[*] Bypassing native fopen: " + path);
                Memory.writeUtf8String(args[0], "/ggezxxx");
            }
        }
    });

    Interceptor.attach(Module.findExportByName("libc.so", "system"), {
        onEnter: function (args) {
            var cmd = Memory.readCString(args[0]);
            if (cmd.includes("getprop") || cmd.includes("mount") || cmd.includes("build.prop") || cmd === "id" || cmd === "su") {
                console.log("[*] Bypassing native system: " + cmd);
                Memory.writeUtf8String(args[0], "grep");
            }
        }
    });

    Interceptor.attach(Module.findExportByName("libc.so", "access"), {
        onEnter: function (args) {
            var path = Memory.readCString(args[0]);
            if (RootBinaries.some(binary => path.includes(binary))) {
                console.log("[*] Bypassing native access: " + path);
                Memory.writeUtf8String(args[0], "/ggezxxx");
            }
        }
    });

    // Frida Detection Bypass
    Interceptor.attach(Module.findExportByName("libc.so", "strstr"), {
        onEnter: function (args) {
            var str1 = Memory.readCString(args[0]);
            var str2 = Memory.readCString(args[1]);
            if (str2.includes("frida") || str2.includes("gadget")) {
                console.log("[*] Bypassing Frida detection: " + str2);
                Memory.writeUtf8String(args[1], "nothing");
            }
        }
    });

    // Emulator Detection Bypass
    var emulatorProps = {
        "ro.product.manufacturer": "Google",
        "ro.product.brand": "google",
        "ro.product.device": "redfin",
        "ro.build.product": "redfin",
        "ro.kernel.qemu": "0",
        "ro.hardware": "qcom",
        "ro.product.board": "redfin"
    };

    SystemProperties.get.overload('java.lang.String').implementation = function (name) {
        if (emulatorProps.hasOwnProperty(name)) {
            console.log("[*] Bypassing emulator prop: " + name + " -> " + emulatorProps[name]);
            return emulatorProps[name];
        }
        return this.get.call(this, name);
    };
});

// Flutter SSL Pinning Bypass
setTimeout(function () {
    console.log("[*] Starting Flutter SSL pinning bypass...");
    var patterns = [
        "ff 03 05 d1 fd 7b 0f a9 bc de 05 94 08 0a 80 52 48", // Original pattern
        "ff 83 00 d1 fd 7b 01 a9 fd 03 00 91 e8 03 00 aa"   // Alternative for newer Flutter versions
    ];
    var module = "libflutter.so";
    var armversion = 8;
    var expectedReturnValue = true;

    Process.enumerateModules().forEach(function (v) {
        if (v.name === module) {
            console.log("[*] Found " + module + " | Base: " + v.base + " | Size: " + v.size);
            patterns.forEach(function (pattern) {
                Memory.scanSync(v.base, v.size, pattern).forEach(function (mem) {
                    var offset = mem.address;
                    if (armversion === 7) {
                        offset = offset.add(1);
                    }
                    console.log("[*] Hooking address: " + offset + " | Size: " + mem.size);
                    Interceptor.attach(offset, {
                        onLeave: function (retval) {
                            console.log("[*] Altering return value at " + offset + " from " + retval + " to " + expectedReturnValue);
                            retval.replace(+expectedReturnValue);
                        }
                    });
                });
            });
        }
    });
}, 1000);
