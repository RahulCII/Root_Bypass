Java.perform(function() {
    try {
        var array_list = Java.use("java.util.ArrayList");
        var ApiClient = Java.use('com.android.org.conscrypt.TrustManagerImpl');
 
        ApiClient.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
            // console.log('Bypassing SSL Pinning');
            var k = array_list.$new();
            return k;
        }
 
    } catch (err) {
        send("Error in root_bypass.js: " + err);
    }
});
 
Java.perform(function() {
 
    var RootPackages = ["com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
        "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
        "com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
        "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
        "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
        "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
        "eu.chainfire.supersu.pro", "com.kingouser.com", "com.android.vending.billing.InAppBillingService.COIN","com.topjohnwu.magisk"
    ];
 
    var RootBinaries = ["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk","magisk"];
 
    var RootProperties = {
        "ro.build.selinux": "1",
        "ro.debuggable": "0",
        "service.adb.root": "0",
        "ro.secure": "1"
    };
 
    var RootPropertiesKeys = [];
 
    for (var k in RootProperties) RootPropertiesKeys.push(k);
 
    var PackageManager = Java.use("android.app.ApplicationPackageManager");
 
    var Runtime = Java.use('java.lang.Runtime');
 
    var NativeFile = Java.use('java.io.File');
 
    var String = Java.use('java.lang.String');
 
    var SystemProperties = Java.use('android.os.SystemProperties');
 
    var BufferedReader = Java.use('java.io.BufferedReader');
 
    var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
 
    var StringBuffer = Java.use('java.lang.StringBuffer');
 
    var loaded_classes = Java.enumerateLoadedClassesSync();
 
    send("Loaded " + loaded_classes.length + " classes!");
 
    var useKeyInfo = false;
 
    var useProcessManager = false;
 
    send("loaded: " + loaded_classes.indexOf('java.lang.ProcessManager'));
 
    if (loaded_classes.indexOf('java.lang.ProcessManager') != -1) {
        useProcessManager = true; // Enable ProcessManager hook
        send("ProcessManager hook loaded");
    } else {
        send("ProcessManager hook not loaded");
    }
 
    if (loaded_classes.indexOf('android.security.keystore.KeyInfo') != -1) {
        useKeyInfo = true; // Enable KeyInfo hook
        send("KeyInfo hook loaded");
    } else {
        send("KeyInfo hook not loaded");
    }
 
    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
        var shouldFakePackage = (RootPackages.indexOf(pname) > -1);
        if (shouldFakePackage) {
            send("Bypass root check for package: " + pname);
            pname = "set.package.name.to.a.fake.one.so.we.can.bypass.it";
        }
        return this.getPackageInfo.call(this, pname, flags);
    };
 
    NativeFile.exists.implementation = function() {
        var name = NativeFile.getName.call(this);
        var shouldFakeReturn = (RootBinaries.indexOf(name) > -1);
        if (shouldFakeReturn) {
            send("Bypass return value for binary: " + name);
            return false;
        } else {
            return this.exists.call(this);
        }
    };
 
    var exec = Runtime.exec.overload('[Ljava.lang.String;');
    var exec1 = Runtime.exec.overload('java.lang.String');
    var exec2 = Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;');
    var exec3 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;');
    var exec4 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File');
    var exec5 = Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;', 'java.io.File');
 
    exec5.implementation = function(cmd, env, dir) {
        if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
            var fakeCmd = "grep";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        if (cmd == "su") {
            var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        if (cmd == "which") {
            var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
            send("Bypass which command");
            return exec1.call(this, fakeCmd);
        }
        return exec5.call(this, cmd, env, dir);
    };
 
    exec4.implementation = function(cmdarr, env, file) {
        for (var i = 0; i < cmdarr.length; i = i + 1) {
            var tmp_cmd = cmdarr[i];
            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                var fakeCmd = "grep";
                send("Bypass " + cmdarr + " command");
                return exec1.call(this, fakeCmd);
            }
 
            if (tmp_cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmdarr + " command");
                return exec1.call(this, fakeCmd);
            }
        }
        return exec4.call(this, cmdarr, env, file);
    };
 
    exec3.implementation = function(cmdarr, envp) {
        for (var i = 0; i < cmdarr.length; i = i + 1) {
            var tmp_cmd = cmdarr[i];
            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                var fakeCmd = "grep";
                send("Bypass " + cmdarr + " command");
                return exec1.call(this, fakeCmd);
            }
 
            if (tmp_cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmdarr + " command");
                return exec1.call(this, fakeCmd);
            }
        }
        return exec3.call(this, cmdarr, envp);
    };
 
    exec2.implementation = function(cmd, env) {
        if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
            var fakeCmd = "grep";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        if (cmd == "su") {
            var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        return exec2.call(this, cmd, env);
    };
 
    exec.implementation = function(cmd) {
        for (var i = 0; i < cmd.length; i = i + 1) {
            var tmp_cmd = cmd[i];
            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                var fakeCmd = "grep";
                send("Bypass " + cmd + " command");
                return exec1.call(this, fakeCmd);
            }
 
            if (tmp_cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmd + " command");
                return exec1.call(this, fakeCmd);
            }
        }
 
        return exec.call(this, cmd);
    };
 
    exec1.implementation = function(cmd) {
        if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh" || cmd.indexOf("which") != -1) {
            var fakeCmd = "grep";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        if (cmd == "su" || cmd.indexOf("magisk") != -1) {
            var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        return exec1.call(this, cmd);
    };
 
    String.contains.implementation = function(name) {
        if (name == "test-keys") {
            send("Bypass test-keys check");
            return false;
        }
        return this.contains.call(this, name);
    };
 
    var get = SystemProperties.get.overload('java.lang.String');
 
    get.implementation = function(name) {
        if (RootPropertiesKeys.indexOf(name) != -1) {
            send("Bypass system property: " + name);
            return RootProperties[name];
        }
        return this.get.call(this, name);
    };
 
    // Hook for native `open` function
    Interceptor.attach(Module.findExportByName("libc.so", "open"), {
        onEnter: function(args) {
            var path = Memory.readCString(args[0]);
            if (path) {
                var shouldFakeReturn = RootBinaries.some(function(binary) {
                    return path.endsWith("/" + binary);
                });
                if (shouldFakeReturn) {
                    send("Bypass native open check for: " + path);
                    this.shouldFakeReturn = true;
                }
            }
        },
        onLeave: function(retval) {
            if (this.shouldFakeReturn) {
                retval.replace(-1); // Simulate file not found
            }
        }
    });
 
    // Hook for `stat` function to simulate file absence
    Interceptor.attach(Module.findExportByName("libc.so", "stat"), {
        onEnter: function(args) {
            var path = Memory.readCString(args[0]);
            if (path) {
                var shouldFakeReturn = RootBinaries.some(function(binary) {
                    return path.endsWith("/" + binary);
                });
                if (shouldFakeReturn) {
                    send("Bypass native stat check for: " + path);
                    this.shouldFakeReturn = true;
                }
            }
        },
        onLeave: function(retval) {
            if (this.shouldFakeReturn) {
                retval.replace(-1); // Simulate file not found
            }
        }
    });
 
    // Hook for `access` function to simulate file absence
    Interceptor.attach(Module.findExportByName("libc.so", "access"), {
        onEnter: function(args) {
            var path = Memory.readCString(args[0]);
            if (path) {
                var shouldFakeReturn = RootBinaries.some(function(binary) {
                    return path.endsWith("/" + binary);
                });
                if (shouldFakeReturn) {
                    send("Bypass native access check for: " + path);
                    this.shouldFakeReturn = true;
                }
            }
        },
        onLeave: function(retval) {
            if (this.shouldFakeReturn) {
                retval.replace(-1); // Simulate file not found
            }
        }
    });
 
    // Hook for `fopen` function to simulate file absence
    Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
        onEnter: function(args) {
            var path = Memory.readCString(args[0]);
            if (path) {
                var shouldFakeReturn = RootBinaries.some(function(binary) {
                    return path.endsWith("/" + binary);
                });
                if (shouldFakeReturn) {
                    send("Bypass native fopen check for: " + path);
                    Memory.writeUtf8String(args[0], "/nonexistent");
                }
            }
        }
    });
 
    // Hook for `system` function to bypass commands
    Interceptor.attach(Module.findExportByName("libc.so", "system"), {
        onEnter: function(args) {
            var cmd = Memory.readCString(args[0]);
            send("SYSTEM CMD: " + cmd);
            if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id") {
                send("Bypass native system: " + cmd);
                Memory.writeUtf8String(args[0], "grep");
            }
            if (cmd == "su") {
                send("Bypass native system: " + cmd);
                Memory.writeUtf8String(args[0], "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled");
            }
        }
    });
 
    // Hook for `readLine` to bypass build.prop checks
    BufferedReader.readLine.overload().implementation = function() {
        var text = this.readLine.call(this);
        if (text !== null && text.indexOf("ro.build.tags=test-keys") > -1) {
            send("Bypass build.prop file read");
            text = text.replace("ro.build.tags=test-keys", "ro.build.tags=release-keys");
        }
        return text;
    };
 
    var executeCommand = ProcessBuilder.command.overload('java.util.List');
 
    ProcessBuilder.start.implementation = function() {
        var cmd = this.command.call(this);
        var shouldModifyCommand = false;
        for (var i = 0; i < cmd.size(); i = i + 1) {
            var tmp_cmd = cmd.get(i).toString();
            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd.indexOf("mount") != -1 || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd.indexOf("id") != -1) {
                shouldModifyCommand = true;
            }
        }
        if (shouldModifyCommand) {
            send("Bypass ProcessBuilder " + cmd);
            this.command.call(this, ["grep"]);
            return this.start.call(this);
        }
        if (cmd.indexOf("su") != -1) {
            send("Bypass ProcessBuilder " + cmd);
            this.command.call(this, ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"]);
            return this.start.call(this);
        }
 
        return this.start.call(this);
    };
 
    if (useProcessManager) {
        try {
            var ProcessManager = Java.use('java.lang.ProcessManager');
            if (ProcessManager && ProcessManager.exec) {
                var ProcManExec = ProcessManager.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File', 'boolean');
                var ProcManExecVariant = ProcessManager.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.lang.String', 'java.io.FileDescriptor', 'java.io.FileDescriptor', 'java.io.FileDescriptor', 'boolean');

                ProcManExec.implementation = function(cmd, env, workdir, redirectstderr) {
                    try {
                        var fake_cmd = cmd;
                        for (var i = 0; i < cmd.length; i++) {
                            var tmp_cmd = cmd[i];
                            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id") {
                                fake_cmd = ["grep"];
                                send("Bypass " + cmd + " command");
                            }
                            if (tmp_cmd == "su") {
                                fake_cmd = ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"];
                                send("Bypass " + cmd + " command");
                            }
                        }
                        return ProcManExec.call(this, fake_cmd, env, workdir, redirectstderr);
                    } catch (err) {
                        send("Error in ProcManExec implementation: " + err);
                        return ProcManExec.call(this, cmd, env, workdir, redirectstderr);
                    }
                };

                ProcManExecVariant.implementation = function(cmd, env, directory, stdin, stdout, stderr, redirect) {
                    try {
                        var fake_cmd = cmd;
                        for (var i = 0; i < cmd.length; i++) {
                            var tmp_cmd = cmd[i];
                            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id") {
                                fake_cmd = ["grep"];
                                send("Bypass " + cmd + " command");
                            }
                            if (tmp_cmd == "su") {
                                fake_cmd = ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"];
                                send("Bypass " + cmd + " command");
                            }
                        }
                        return ProcManExecVariant.call(this, fake_cmd, env, directory, stdin, stdout, stderr, redirect);
                    } catch (err) {
                        send("Error in ProcManExecVariant implementation: " + err);
                        return ProcManExecVariant.call(this, cmd, env, directory, stdin, stdout, stderr, redirect);
                    }
                };
            } else {
                send("ProcessManager.exec not available");
            }
        } catch (err) {
            send("ProcessManager Hook failed: " + err);
        }
    }

    if (useKeyInfo) {
        try {
            var KeyInfo = Java.use('android.security.keystore.KeyInfo');
            if (KeyInfo && KeyInfo.isInsideSecureHardware) {
                KeyInfo.isInsideSecureHardware.implementation = function() {
                    try {
                        send("Bypass isInsideSecureHardware");
                        return true;
                    } catch (err) {
                        send("Error in KeyInfo.isInsideSecureHardware implementation: " + err);
                        return this.isInsideSecureHardware.call(this);
                    }
                };
            } else {
                send("KeyInfo.isInsideSecureHardware not available");
            }
        } catch (err) {
            send("KeyInfo Hook failed: " + err);
        }
    }
 
});


setTimeout(function () {
    // pattern bytes
    var pattern = "ff 03 05 d1 fd 7b 0f a9 bc de 05 94 08 0a 80 52 48"
    // library name
    var module = "libflutter.so"
    // define your arm version
    var armversion = 8
    // expected return value
    var expectedReturnValue = true
    
    // random string, you may ignore this
    console.log("Horangi - Bypass Flutter SSL Pinning")
    // enumerate all process
    Process.enumerateModules().forEach(v => {
        // if the module matches with our library
        if(v['name'] == module) {
            // debugging purposes
            console.log("Base: ", v['base'], "| Size: ", v['size'], "\n")
            // scanning memory - synchronous version
            // compare it based on base, size and pattern
            Memory.scanSync(v['base'], v['size'], pattern).forEach(mem => {
                // assign address to variable offset
                var offset = mem['address']
                if(armversion === 7) {
                    // armv7 add 1
                    offset = offset.add(1)
                }
                // another debugging purposes
                console.log("Address:",offset,"::", mem['size'])
                // hook to the address
                Interceptor.attach(offset, {
                    // when leaving the address, 
                    onLeave: function(retval) {
                        // execute this debugging purpose (again)
                        console.log("ReturnValue",offset,"altered from", +retval,"to", +expectedReturnValue)
                        // replace the return value to expectedReturnValue
                        retval.replace(+expectedReturnValue);
                    }
                })
            })
        }
    });
}, 1000)

Java.perform(function() {
    try {
        // Hook for dynamic class/method enumeration
        Java.enumerateLoadedClasses({
            onMatch: function(className) {
                if (className.toLowerCase().indexOf("root") !== -1 || className.toLowerCase().indexOf("debug") !== -1) {
                    send("Potential Root/Debug Class: " + className);
                }
            },
            onComplete: function() {
                send("Class enumeration completed.");
            }
        });

        // Hook for detecting native library loads
        Interceptor.attach(Module.findExportByName(null, "dlopen"), {
            onEnter: function(args) {
                var libName = Memory.readCString(args[0]);
                send("Native Library Loaded: " + libName);
                if (libName.indexOf("root") !== -1 || libName.indexOf("debug") !== -1) {
                    send("Potential Root/Debug Library: " + libName);
                }
            }
        });

        // Hook for detecting anti-debugging methods
        var Debug = Java.use("android.os.Debug");
        Debug.isDebuggerConnected.implementation = function() {
            send("Bypass Debugger Check");
            return false;
        };

        // Hook for detecting stack traces
        var Throwable = Java.use("java.lang.Throwable");
        Throwable.printStackTrace.implementation = function() {
            send("Stack Trace Captured");
            return this.printStackTrace.call(this);
        };

        // Hook for detecting runtime.exec calls
        Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
            send("Runtime.exec called with command: " + cmd);
            if (cmd.indexOf("getprop") !== -1 || cmd.indexOf("su") !== -1) {
                send("Bypass Runtime.exec command: " + cmd);
                return this.exec.call(this, "grep");
            }
            return this.exec.call(this, cmd);
        };

        // Hook for detecting system properties
        SystemProperties.get.overload('java.lang.String').implementation = function(name) {
            send("System Property Accessed: " + name);
            if (RootPropertiesKeys.indexOf(name) !== -1) {
                send("Bypass System Property: " + name);
                return RootProperties[name];
            }
            return this.get.call(this, name);
        };

        // Hook for detecting file checks
        NativeFile.exists.implementation = function() {
            var path = this.getAbsolutePath.call(this);
            send("File Check: " + path);
            if (RootBinaries.indexOf(path) !== -1) {
                send("Bypass File Check: " + path);
                return false;
            }
            return this.exists.call(this);
        };

        // Hook for detecting fopen calls
        Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
            onEnter: function(args) {
                var path = Memory.readCString(args[0]);
                send("fopen called with path: " + path);
                if (path.indexOf("su") !== -1 || path.indexOf("magisk") !== -1) {
                    send("Bypass fopen for path: " + path);
                    Memory.writeUtf8String(args[0], "/nonexistent");
                }
            }
        });

        // Hook for detecting system calls
        Interceptor.attach(Module.findExportByName("libc.so", "system"), {
            onEnter: function(args) {
                var cmd = Memory.readCString(args[0]);
                send("system called with command: " + cmd);
                if (cmd.indexOf("getprop") !== -1 || cmd.indexOf("su") !== -1) {
                    send("Bypass system command: " + cmd);
                    Memory.writeUtf8String(args[0], "grep");
                }
            }
        });

        // Hook for detecting anti-debugging flags
        var Build = Java.use("android.os.Build");
        Build.TAGS.value = "release-keys";
        send("Bypass Build Tags Check");

        // Hook for detecting SELinux status
        var SELinux = Java.use("android.os.SELinux");
        SELinux.isSELinuxEnforced.implementation = function() {
            send("Bypass SELinux Enforcement Check");
            return false;
        };

        // Hook for detecting root package checks
        PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
            send("Package Check: " + pname);
            if (RootPackages.indexOf(pname) !== -1) {
                send("Bypass Package Check: " + pname);
                pname = "fake.package.name";
            }
            return this.getPackageInfo.call(this, pname, flags);
        };

        // Hook for detecting root binaries
        Interceptor.attach(Module.findExportByName("libc.so", "access"), {
            onEnter: function(args) {
                var path = Memory.readCString(args[0]);
                send("access called with path: " + path);
                if (path.indexOf("su") !== -1 || path.indexOf("magisk") !== -1) {
                    send("Bypass access for path: " + path);
                    this.shouldFakeReturn = true;
                }
            },
            onLeave: function(retval) {
                if (this.shouldFakeReturn) {
                    retval.replace(-1);
                }
            }
        });

    } catch (err) {
        send("Error in root_bypass.js: " + err);
    }
});
