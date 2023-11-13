"use strict";

// @IMPORTS
const fs = require("fs");
const tslog = require("tslog");
const moment = require("moment");
const merge = require("merge");
const EventEmitter = require("events").EventEmitter;
const emitterInstance = new EventEmitter();
const Tools = require("./Tools.js");


class Application {
	static emitter = new EventEmitter();
	static moduleObjs = [];
	static modules = {};

	static stop() {
		return new Promise(() => {
			return Application.stopModules().then(() => {
				this.emitter.emit("stop");
				// i needed an event, its used in the solver module
				// to know when to remove worker pool
			}, (err) => {
				this.log.error(err);
				process.exit(1);
			});
		});
	}

	static configure(config) {
		if (config.stage) {
			config.stage = config.stage.toLowerCase();
		}

		this.config = merge.recursive({
			logformat: "dddd, MMMM Do YYYY, h:mm:ss a",
			logLevelConsole: "debug",
			logDisabled: false,
			quiet: false
		}, config);

		this.log = this.getLogger("application");
		this.scriptName = null;
	}

	/**
	 * @param { string } name
	 * @return { tslog.Logger<void> }
	 */
	static getLogger(name) {
		return new tslog.Logger({
			name,
			hideLogPositionForProduction: true,
			prettyLogTemplate: "{{dd}}.{{mm}}.{{yyyy}} {{hh}}:{{MM}}:{{ss}} - {{logLevelName}}: [{{name}}] ",
			prettyLogTimeZone: "local"
		})
	}

	static loadModuleConfig(moduleName) {
		const configJsonLocation = this.config.config_path + "/" + moduleName + ".json";
		const localConfigJsonLocation = this.config.config_path + "/" + moduleName + ".local.json";
		let localConfig = {};

		if (!fs.existsSync(configJsonLocation)) {
			fs.writeFileSync(configJsonLocation, "{}");
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
				} else {
					stagedConfig = merge.recursive(stagedConfig, localConfig);
					return stagedConfig;
				}
			}
		} catch (e) {
			throw new Error("config of module " + moduleName + " contains invalid json data: " + e.toString());
		}
	}

	static registerModule(moduleName) {
		const mainModuleFile = this.config.modules_path + "/" + moduleName + "/module.js";

		if (!fs.existsSync(mainModuleFile)) {
			throw new Error("Missing module.js for module " + moduleName);
		}

		const moduleConfig = this.loadModuleConfig(moduleName);

		const moduleObj = {
			name: moduleName,
			mainPath: mainModuleFile,
			rootPath: this.config.modules_path + "/" + moduleName,
			config: moduleConfig
		};

		const moduleClass = require(mainModuleFile);
		const moduleInstance = new moduleClass(moduleName, moduleConfig, moduleObj);

		moduleObj.instance = moduleInstance;

		this.moduleObjs.push(moduleObj);
		this.modules[moduleName] = moduleInstance;

		return moduleInstance;
	}

	static initModules() {
		return new Promise((resolve, reject) => {
			this.log.info("Initializing Modules");

			Promise.all(this.moduleObjs.map(m => m.instance.init()))
				.then(resolve, reject);
		});
	}

	static startModules() {
		return new Promise((resolve, reject) => {
			this.log.info("Starting Modules");

			Promise.all(this.moduleObjs.map(m => m.instance.start()))
				.then(resolve, reject);
		});
	}

	static stopModules() {
		return new Promise((resolve, reject) => {
			this.log.info("Stopping Modules");

			Promise.all(this.moduleObjs.map(m => m.instance.stop()))
				.then(() => {
					this.moduleObjs = null;
					this.modules = null;
					resolve();
				})
				.catch(reject);
		});
	}

	static loadApplicationConfigs() {
		return new Promise(resolve => {
			const rootDir = Application.config.config_path + "/application";
			const files = fs.readdirSync(rootDir);
			const applicationConfig = {};
			let i;

			for (i = 0; i < files.length; i++) {
				const file = files[i];
				if (file == ".gitkeep") {
					continue;
				}
				const config = Tools.loadCommentedConfigFile(rootDir + "/" + file);

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
		return id === this.getClientId();
	}

	static getClient() {
		return Application.modules.Discord.client;
	}

	static getClientId() {
		return Application.modules.Discord.client.user.id;
	}

	static getUser(userId) {
		return Application.modules.Discord.client.users.fetch(userId);
	}
}

module.exports = Application;
