"use strict";

// @IMPORTS
var fs = require("fs");
var os = require("os");
var winston = require("winston");
var moment = require("moment");
var momentTimezone = require("moment-timezone");
var merge = require("merge");
var EventEmitter = require('events').EventEmitter;
var emitterInstance = new EventEmitter();
var Tools = require("./Tools.js");
var Promise = require("bluebird");

module.exports = class Application {

    constructor() {
        throw "Cannot construct singleton";
    }

    static stop() {
        return new Promise((resolve, reject) => {
            return Application.stopModules().then(() => {
                process.exit(0);
                resolve();
            }, (err) => {
                this.log.error(err);
                process.exit(1);
                resolve();
            });
        });
    }

    static configure(config) {
        if (config.stage) {
            config.stage = config.stage.toLowerCase();
        }

        Promise.config({
            warnings: {
                wForgottenReturn: false //config.stage === "dev"
            }
        });

        this.config = merge.recursive({
            logformat: "dddd, MMMM Do YYYY, h:mm:ss a",
            logLevelConsole: "debug",
            logDisabled: false,
            quiet: false
        }, config);
        this.moduleObjs = [];
        this.modules = {};

        winston.setLevels({
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        });

        winston.addColors({
            debug: 'blue',
            info: 'grey',
            warn: 'yellow',
            error: 'red'
        });

        this.log = this.getLogger("application");
        this.scriptName = null;

        Promise.onPossiblyUnhandledRejection((err) => {
            this.log.error(err);
        });

        process.on('uncaughtException', (err) => {
            this.log.error(err);
            process.exit(1);
        })
    }

    static isDev() {
        return this.config.stage === "dev" || this.config.stage === "development";
    }

    static isProd() {
        return this.config.stage === "prod" || this.config.stage === "production";
    }

    static isRunning() {
        return this.running;
    }

    static getLogger(name) {
        var transports = [];
        if (!Application.config.logDisabled) {
            transports = [
                new winston.transports.Console({
                    level: Application.config.logLevelConsole,
                    colorize: true,
                    json: false,
                    label: name.toUpperCase(),
                    timestamp: () => {
                        return moment().format(this.config.logformat);
                    }
                }),
            ];

        }

        return new (winston.Logger)({
            transports: transports
        });
    }

    static loadModuleConfig(moduleName) {
        var configJsonLocation = this.config.config_path + "/" + moduleName + ".json";
        var localConfigJsonLocation = this.config.config_path + "/" + moduleName + ".local.json";
        var localConfig = {};

        if (!fs.existsSync(configJsonLocation)) {
            fs.writeFileSync(configJsonLocation, "{}");
        }

        try {
            var config = Tools.loadCommentedConfigFile(configJsonLocation);
        } catch (e) {
            throw new Error("config of module " + moduleName + " contains invalid json data: " + e.toString());
        }

        var stagedConfig = {};

        var configHasStages = false;

        for (var i = 0; i < this.config.stages.length; i++) {
            var stage = this.config.stages[i];

            if (config[stage]) {
                configHasStages = true;
                stagedConfig = merge.recursive(stagedConfig, config[stage]);
            }

            if (stage == this.config.stage) {
                break;
            }
        }

        // env

        if (fs.existsSync(localConfigJsonLocation)) {
            localConfig = Tools.loadCommentedConfigFile(localConfigJsonLocation);
        }

        if (!configHasStages) {
            config = merge.recursive(config, localConfig);
            return config;
        } else {
            stagedConfig = merge.recursive(stagedConfig, localConfig);
            return stagedConfig;
        }
    }

    static registerModule(moduleName) {
        var mainModuleFile = this.config.modules_path + "/" + moduleName + "/module.js";

        if (!fs.existsSync(mainModuleFile)) {
            throw new Error("Missing module.js for module " + moduleName);
        }

        var moduleConfig = this.loadModuleConfig(moduleName);

        var moduleObj = {
            name: moduleName,
            mainPath: mainModuleFile,
            rootPath: this.config.modules_path + "/" + moduleName,
            config: moduleConfig
        };

        try {
            var moduleClass = require(mainModuleFile);
            var moduleInstance = new moduleClass(moduleName, moduleConfig, moduleObj);
        } catch (e) {
            throw e;
        }

        moduleObj.instance = moduleInstance;

        this.moduleObjs.push(moduleObj);
        this.modules[moduleName] = moduleInstance;

        return moduleInstance;
    }

    static initModules() {
        return new Promise((resolve, reject) => {
            var initTasks = [];
            this.log.info("Initializing Modules");

            Promise.each(this.moduleObjs, (moduleObj, index, length) => {
                return moduleObj.instance.init();
            }).then(function () {
                resolve();
            }, function (err) {
                reject(err);
            });
        });
    }

    static startModules() {
        return new Promise((resolve, reject) => {
            var startTasks = [];
            this.log.info("Starting Modules");

            Promise.each(this.moduleObjs, (moduleObj, index, length) => {
                return moduleObj.instance.start();
            }).then(function () {
                resolve();
            }, function (err) {
                reject(err);
            });
        });
    }

    static stopModules() {
        return new Promise((resolve, reject) => {
            var stopTasks = [];
            this.log.info("Stopping Modules");

            Promise.each(this.moduleObjs, (moduleObj, index, length) => {
                return moduleObj.instance.stop();
            }).then(() => {
                this.moduleObjs = null;
                this.modules = null;
                resolve();
            }, function (err) {
                reject(err);
            });
        });
    }

    static loadApplicationConfigs() {
        return new Promise((resolve, reject) => {
            var rootDir = Application.config.config_path + "/application";
            var files = fs.readdirSync(rootDir);
            var applicationConfig = {};

            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (file == '.gitkeep') {
                    continue;
                }
                var config = Tools.loadCommentedConfigFile(rootDir + "/" + file);

                applicationConfig[file.replace(/^(.*?)\.json$/, "$1")] = config;
            }

            this.appConfigs = applicationConfig;

            resolve();
        });
    }

    static run() {
        return new Promise((resolve, reject) => {
            this.loadApplicationConfigs().then(() => {
                return this.initModules();
            }).then(() => {
                return this.startModules();
            }).then(() => {

                this.log.info("Application started");

                this.running = true;

                resolve(true);
            }, (err) => {
                if (!err) {
                    err = new Error("Unkown error!");
                }

                this.log.error(err);

                reject(new Error(err));
            });
        });
    }

    static on() {
        emitterInstance.on.apply(this, arguments);
    }

    static emit() {
        emitterInstance.emit.apply(this, arguments);
    }

    static checkSelf(id) {
        return String(id) === String(this.getClientId())
    }

    static getClient() {
        return Application.modules.Discord.client;
    }

    static getClientId() {
        return Application.modules.Discord.client.user.id;
    }
};
