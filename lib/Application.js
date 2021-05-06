'use strict';

// @IMPORTS
const fs = require('fs');
const winston = require('winston');
const moment = require('moment');
const merge = require('merge');
const EventEmitter = require('events').EventEmitter;
const emitterInstance = new EventEmitter();
const Tools = require('./Tools.js');
const Promise = require('bluebird');

const Application = {
    emitter: new EventEmitter(),
    stop() {
        return new Promise(() => {
            return Application.stopModules().then(() => {
                this.emitter.emit('stop');
                // i needed an event, its used in the solver module
                // to know when to remove worker pool
            }, (err) => {
                this.log.error(err);
                process.exit(1);
            });
        });
    },

    configure(config) {
        if (config.stage) {
            config.stage = config.stage.toLowerCase();
        }

        Promise.config({
            warnings: {
                // config.stage === 'dev'
                wForgottenReturn: false,
            },
        });

        this.config = merge.recursive({
            logformat: 'dddd, MMMM Do YYYY, h:mm:ss a',
            logLevelConsole: 'debug',
            logDisabled: false,
            quiet: false,
        }, config);
        this.moduleObjs = [];
        this.modules = {};

        winston.setLevels({
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        });

        winston.addColors({
            debug: 'blue',
            info: 'grey',
            warn: 'yellow',
            error: 'red',
        });

        this.log = this.getLogger('application');
        this.scriptName = null;

        Promise.onPossiblyUnhandledRejection((err) => {
            this.log.error(err);
        });

        process.on('uncaughtException', (err) => {
            this.log.error(err);
            process.exit(1);
        });
    },

    isDev() {
        return this.config.stage === 'dev' || this.config.stage === 'development';
    },

    isProd() {
        return this.config.stage === 'prod' || this.config.stage === 'production';
    },

    isRunning() {
        return this.running;
    },

    getLogger(name) {
        let transports = [];
        if (!Application.config.logDisabled) {
            transports = [
                new winston.transports.Console({
                    level: Application.config.logLevelConsole,
                    colorize: true,
                    json: false,
                    label: name.toUpperCase(),
                    timestamp: () => {
                        return moment().format(this.config.logformat);
                    },
                }),
            ];

        }

        return new (winston.Logger)({
            transports: transports,
        });
    },

    loadModuleConfig(moduleName) {
        const configJsonLocation = this.config.config_path + '/' + moduleName + '.json';
        const localConfigJsonLocation = this.config.config_path + '/' + moduleName + '.local.json';
        let localConfig = {};

        if (!fs.existsSync(configJsonLocation)) {
            fs.writeFileSync(configJsonLocation, '{}');
        }

        try {
            let config = Tools.loadCommentedConfigFile(configJsonLocation);
            let stagedConfig = {};
            let configHasStages = false;
            let i;

            for (i = 0; i < this.config.stages.length; i++) {
                const stage = this.config.stages[i];

                if (config[stage]) {
                    configHasStages = true;
                    stagedConfig = merge.recursive(stagedConfig, config[stage]);
                }

                if (stage == this.config.stage) {
                    break;
                }

                // env

                if (fs.existsSync(localConfigJsonLocation)) {
                    localConfig = Tools.loadCommentedConfigFile(localConfigJsonLocation);
                }

                if (!configHasStages) {
                    config = merge.recursive(config, localConfig);
                    return config;
                }
                else {
                    stagedConfig = merge.recursive(stagedConfig, localConfig);
                    return stagedConfig;
                }
            }
        }
        catch (e) {
            throw new Error('config of module ' + moduleName + ' contains invalid json data: ' + e.toString());
        }
    },

    registerModule(moduleName) {
        const mainModuleFile = this.config.modules_path + '/' + moduleName + '/module.js';

        if (!fs.existsSync(mainModuleFile)) {
            throw new Error('Missing module.js for module ' + moduleName);
        }

        const moduleConfig = this.loadModuleConfig(moduleName);

        const moduleObj = {
            name: moduleName,
            mainPath: mainModuleFile,
            rootPath: this.config.modules_path + '/' + moduleName,
            config: moduleConfig,
        };

        const moduleClass = require(mainModuleFile);
        const moduleInstance = new moduleClass(moduleName, moduleConfig, moduleObj);

        moduleObj.instance = moduleInstance;

        this.moduleObjs.push(moduleObj);
        this.modules[moduleName] = moduleInstance;

        return moduleInstance;
    },

    initModules() {
        return new Promise((resolve, reject) => {
            this.log.info('Initializing Modules');

            Promise.each(this.moduleObjs, moduleObj => {
                return moduleObj.instance.init();
            }).then(resolve, reject);
        });
    },

    startModules() {
        return new Promise((resolve, reject) => {
            this.log.info('Starting Modules');

            Promise.each(this.moduleObjs, moduleObj => {
                return moduleObj.instance.start();
            }).then(resolve, reject);
        });
    },

    stopModules() {
        return new Promise((resolve, reject) => {
            this.log.info('Stopping Modules');

            Promise.each(this.moduleObjs, moduleObj => {
                return moduleObj.instance.stop();
            }).then(() => {
                this.moduleObjs = null;
                this.modules = null;
                resolve();
            }).catch(reject);
        });
    },

    loadApplicationConfigs() {
        return new Promise(resolve => {
            const rootDir = Application.config.config_path + '/application';
            const files = fs.readdirSync(rootDir);
            const applicationConfig = {};
            let i;

            for (i = 0; i < files.length; i++) {
                const file = files[i];
                if (file == '.gitkeep') {
                    continue;
                }
                const config = Tools.loadCommentedConfigFile(rootDir + '/' + file);

                applicationConfig[file.replace(/^(.*?)\.json$/, '$1')] = config;
            }

            this.appConfigs = applicationConfig;

            resolve();
        });
    },

    run() {
        return new Promise((resolve, reject) => {
            this.loadApplicationConfigs().then(() => {
                return this.initModules();
            }).then(() => {
                return this.startModules();
            }).then(() => {

                this.log.info('Application started');

                this.running = true;

                resolve(true);
            }, (err) => {
                if (!err) {
                    err = new Error('Unkown error!');
                }

                this.log.error(err);

                reject(new Error(err));
            });
        });
    },

    on() {
        emitterInstance.on.apply(this, arguments);
    },

    emit() {
        emitterInstance.emit.apply(this, arguments);
    },

    checkSelf(id) {
        return id === this.getClientId();
    },

    getClient() {
        return Application.modules.Discord.client;
    },

    getClientId() {
        return Application.modules.Discord.client.user.id;
    },

    getUser(userId) {
        return Application.modules.Discord.client.users.fetch(userId);
    },
};

module.exports = Application;
