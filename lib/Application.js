"use strict";

// @IMPORTS
const fs = require("fs");
const tslog = require("tslog");
const merge = require("merge");
const EventEmitter = require("events").EventEmitter;
const Tools = require("./Tools.js");
const path = require("path");
const { FluentBundle, FluentResource } = require("@fluent/bundle");

class Application {
	static emitter = new EventEmitter();
	/** @type { ReturnType<typeof Application["getLogger"]> } */
	static log = /** @type { any } */ (undefined);

	// TODO: improve this type
	/** @type { Array<{ instance: Module<unknown> }> } */
	static moduleObjs = [];

	static stop() {
		return Application.stopModules().then(() => {
			this.emitter.emit("stop");
			// i needed an event, its used in the solver module
			// to know when to remove worker pool
		}, (err) => {
			this.log.error(err);
			process.exit(1);
		});
	}

	/**
	 * @param {{
	 *    rootDir: string;
	 *    modules_path: string;
	 *    config_path: string;
	 *    stage: string;
	 *    logLevelConsole: string;
	 *    logLevelFile: string;
	 *    logLevelRemote: string;
	 *    logformat: string;
	 *    logDir: string;
	 *    stages: Array<string>;
	 * }} config
	 */
	static configure(config) {
		if (config.stage) {
			config.stage = config.stage.toLowerCase();
		}

		this.config = /** @type { typeof config } */ (merge.recursive({
			logformat: "dddd, MMMM Do YYYY, h:mm:ss a",
			logLevelConsole: "debug",
			logDisabled: false,
			quiet: false
		}, config));

		this.log = this.getLogger("application");
		this.scriptName = null;

		this.modules_init();
	}

	static modules_init() {
		this.modules = {
			// Activity: this.make_module({
			// 	name: "Discord",
			// 	main_path: "../modules/Activity/module.js",
			// 	main_class: require("../modules/Activity/module.js"),
			// 	config: require("../config/Activity.json")
			// }),
			Discord: this.make_module({
				name: "Discord",
				main_path: "../modules/Discord/module.js",
				main_class: require("../modules/Discord/module.js"),
				config: require("../config/Discord.json")
			}),
			Overload: this.make_module({
				name: "Overload",
				main_path: "../modules/Overload/module.js",
				main_class: require("../modules/Overload/module.js"),
				config: require("../config/Overload.json")
			}),
			Ignore: this.make_module({
				name: "Ignore",
				main_path: "../modules/Ignore/module.js",
				main_class: require("../modules/Ignore/module.js"),
				config: require("../config/Ignore.json")
			}),
			Holiday: this.make_module({
				name: "Holiday",
				main_path: "../modules/Holiday/module.js",
				main_class: require("../modules/Holiday/module.js"),
				config: require("../config/Holiday.json")
			}),
			Potato: this.make_module({
				name: "Potato",
				main_path: "../modules/Potato/module.js",
				main_class: require("../modules/Potato/module.js"),
				config: require("../config/Potato.json")
			}),
			UserJoined: this.make_module({
				name: "UserJoined",
				main_path: "../modules/UserJoined/module.js",
				main_class: require("../modules/UserJoined/module.js"),
				config: require("../config/UserJoined.json")
			}),
			Help: this.make_module({
				name: "Help",
				main_path: "../modules/Help/module.js",
				main_class: require("../modules/Help/module.js"),
				config: require("../config/Help.json")
			}),
			TimeToGalacon: this.make_module({
				name: "TimeToGalacon",
				main_path: "../modules/TimeToGalacon/module.js",
				main_class: require("../modules/TimeToGalacon/module.js"),
				config: require("../config/TimeToGalacon.json")
			}),
			Boop: this.make_module({
				name: "Boop",
				main_path: "../modules/Boop/module.js",
				main_class: require("../modules/Boop/module.js"),
				config: require("../config/Boop.json")
			}),
			Bap: this.make_module({
				name: "Bap",
				main_path: "../modules/Bap/module.js",
				main_class: require("../modules/Bap/module.js"),
				config: require("../config/Bap.json")
			}),
			Hug: this.make_module({
				name: "Hug",
				main_path: "../modules/Hug/module.js",
				main_class: require("../modules/Hug/module.js"),
				config: require("../config/Hug.json")
			}),
			Fanta: this.make_module({
				name: "Fanta",
				main_path: "../modules/Fanta/module.js",
				main_class: require("../modules/Fanta/module.js"),
				config: require("../config/Fanta.json")
			}),
			Bizaam: this.make_module({
				name: "Bizaam",
				main_path: "../modules/Bizaam/module.js",
				main_class: require("../modules/Bizaam/module.js"),
				config: require("../config/Bizaam.json")
			}),
			Assfart: this.make_module({
				name: "Assfart",
				main_path: "../modules/Assfart/module.js",
				main_class: require("../modules/Assfart/module.js"),
				config: require("../config/Assfart.json")
			}),
			BestPony: this.make_module({
				name: "BestPony",
				main_path: "../modules/BestPony/module.js",
				main_class: require("../modules/BestPony/module.js"),
				config: require("../config/BestPony.json")
			}),
			WorstPony: this.make_module({
				name: "WorstPony",
				main_path: "../modules/WorstPony/module.js",
				main_class: require("../modules/WorstPony/module.js"),
				config: require("../config/WorstPony.json")
			}),
			MentionCanni: this.make_module({
				name: "MentionCanni",
				main_path: "../modules/MentionCanni/module.js",
				main_class: require("../modules/MentionCanni/module.js"),
				config: require("../config/MentionCanni.json")
			}),
			DevCommands: this.make_module({
				name: "DevCommands",
				main_path: "../modules/DevCommands/module.js",
				main_class: require("../modules/DevCommands/module.js"),
				config: require("../config/DevCommands.json")
			}),
			Solver: this.make_module({
				name: "Solver",
				main_path: "../modules/Solver/module.js",
				main_class: require("../modules/Solver/module.js"),
				config: require("../config/Solver.json")
			}),
			GamerCanni: this.make_module({
				name: "GamerCanni",
				main_path: "../modules/GamerCanni/module.js",
				main_class: require("../modules/GamerCanni/module.js"),
				config: require("../config/GamerCanni.json")
			}),
			Greetings: this.make_module({
				name: "Greetings",
				main_path: "../modules/Greetings/module.js",
				main_class: require("../modules/Greetings/module.js"),
				config: require("../config/Greetings.json")
			}),
			Compliment: this.make_module({
				name: "Compliment",
				main_path: "../modules/Compliment/module.js",
				main_class: require("../modules/Compliment/module.js"),
				config: require("../config/Compliment.json")
			}),
			Hype: this.make_module({
				name: "Hype",
				main_path: "../modules/Hype/module.js",
				main_class: require("../modules/Hype/module.js"),
				config: require("../config/Hype.json")
			}),
			// RoutineMessages: this.make_module({
			// 	name: "RoutineMessages",
			// 	main_path: "../modules/RoutineMessages/module.js",
			// 	main_class: require("../modules/RoutineMessages/module.js"),
			// 	config: require("../config/RoutineMessages.json")
			// }),
			InterBotCom: this.make_module({
				name: "InterBotCom",
				main_path: "../modules/InterBotCom/module.js",
				main_class: require("../modules/InterBotCom/module.js"),
				config: require("../config/InterBotCom.json")
			}),
			NoMessageProcessor: this.make_module({
				name: "NoMessageProcessor",
				main_path: "../modules/NoMessageProcessor/module.js",
				main_class: require("../modules/NoMessageProcessor/module.js"),
				config: require("../config/NoMessageProcessor.json")
			})
		};
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

	// static loadModuleConfig(moduleName) {
	// 	const configJsonLocation = this.config.config_path + "/" + moduleName + ".json";
	// 	const localConfigJsonLocation = this.config.config_path + "/" + moduleName + ".local.json";
	// 	let localConfig = {};
	//
	// 	if (!fs.existsSync(configJsonLocation)) {
	// 		fs.writeFileSync(configJsonLocation, "{}");
	// 	}
	//
	// 	try {
	// 		let config = Tools.loadCommentedConfigFile(configJsonLocation);
	// 		let stagedConfig = {};
	// 		let configHasStages = false;
	// 		let i;
	//
	// 		for (i = 0; i < this.config.stages.length; i++) {
	// 			const stage = this.config.stages[i];
	//
	// 			if (config[stage]) {
	// 				configHasStages = true;
	// 				stagedConfig = merge.recursive(stagedConfig, config[stage]);
	// 			}
	//
	// 			if (stage == this.config.stage) {
	// 				break;
	// 			}
	//
	// 			// env
	//
	// 			if (fs.existsSync(localConfigJsonLocation)) {
	// 				localConfig = Tools.loadCommentedConfigFile(localConfigJsonLocation);
	// 			}
	//
	// 			if (!configHasStages) {
	// 				config = merge.recursive(config, localConfig);
	// 				return config;
	// 			} else {
	// 				stagedConfig = merge.recursive(stagedConfig, localConfig);
	// 				return stagedConfig;
	// 			}
	// 		}
	// 	} catch (e) {
	// 		throw new Error("config of module " + moduleName + " contains invalid json data: " + e.toString());
	// 	}
	// }

	// static registerModule(moduleName) {
	// 	const mainModuleFile = this.config.modules_path + "/" + moduleName + "/module.js";
	//
	// 	if (!fs.existsSync(mainModuleFile)) {
	// 		throw new Error("Missing module.js for module " + moduleName);
	// 	}
	//
	// 	const moduleConfig = this.loadModuleConfig(moduleName);
	//
	// 	const moduleObj = {
	// 		name: moduleName,
	// 		mainPath: mainModuleFile,
	// 		rootPath: this.config.modules_path + "/" + moduleName,
	// 		config: moduleConfig
	// 	};
	//
	// 	const moduleClass = require(mainModuleFile);
	// 	const moduleInstance = new moduleClass(moduleName, moduleConfig, moduleObj);
	//
	// 	moduleObj.instance = moduleInstance;
	//
	// 	this.moduleObjs.push(moduleObj);
	// 	this.modules[moduleName] = moduleInstance;
	//
	// 	return moduleInstance;
	// }

	/**
	 * @template C
	 * @template { Module<C> } M
	 *
	 * @param { object } o
	 * @param { string } o.name
	 * @param { string } o.main_path AFAIK, not actually used, but still provided just in case
	 *    it is, so to not break things
	 * @param { new (
	 *    name: string,
	 *    config: C,
	 *    module_config: import("./Module").ModuleConfig<C>
	 * ) => M } o.main_class
	 * @param { C } o.config
	 */
	static make_module({
		name,
		main_path,
		main_class,
		config
	}) {
		main_path = path.resolve(__dirname, main_path);
		let root_path = path.dirname(main_path);
		let ftl_bundle = this.get_ftl(name);

		// TODO: name, mainPath, rootPath, seem to not be needed, try removing them after all errors are cleared
		// they've been removed from the module type already (in lib/Module.js),
		// so type-wise its not available, but will still be available in runtime
		// _in case_ there actually is something using it
		const moduleConfig = {
			name,
			mainPath: main_path,
			rootPath: root_path,
			config,
			ftl_bundle
		};

		const instance = new main_class(name, config, moduleConfig);
		this.moduleObjs.push({ ...moduleConfig, instance });

		return instance;
	}

	/**
	 * @param { string } module_name
	 */
	static get_ftl(module_name) {
		let full_path = path.resolve(this.config.rootDir, "./ftl", module_name + ".ftl");
		if (!fs.existsSync(full_path)) {
			this.log.debug(`${module_name} doesn't have an ftl bundle`);
			return;
		}

		this.log.debug(`loading ftl bundle for ${module_name}: ${full_path}`);
		let ftl = fs.readFileSync(full_path, "utf8");
		let resource = new FluentResource(ftl);
		let bundle = new FluentBundle("en");
		let errors = bundle.addResource(resource);

		if (errors.length > 0) {
			this.log.error("ftl resource failed to parse");
			for (let error of errors) {
				this.log.error(error);
			}

			if (process.env["NODE_ENV"] === "production") {
				process.exit(1);
			}
		}

		return bundle;
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

	/**
	 * @returns { Promise<void> }
	 */
	static stopModules() {
		return new Promise((resolve, reject) => {
			this.log.info("Stopping Modules");

			if (this.moduleObjs) {
				Promise.all(this.moduleObjs.map(m => m.instance.stop()))
					.then(() => {
						this.moduleObjs = null;
						resolve();
					})
					.catch(reject);
			} else {
				resolve();
			}
		});
	}

	static loadApplicationConfigs() {
		return new Promise(resolve => {
			const rootDir = Application.config.config_path + "/application";
			const files = fs.readdirSync(rootDir);
			/** @type {{ [k: string]: object }} */
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

	/** @type { NodeJS.EventEmitter["on"] } */
	static on(...args) {
		return this.emitter.on(...args);
	}

	/** @type { NodeJS.EventEmitter["emit"] } */
	static emit(...args) {
		return this.emitter.emit(...args);
	}

	/**
	 * @param { string } id
	 */
	static checkSelf(id) {
		return id === this.getClientId();
	}

	static getClient() {
		return Application.modules.Discord.client;
	}

	static getClientId() {
		return Application.modules.Discord.client.user.id;
	}

	/**
	 * @param { string } userId
	 */
	static getUser(userId) {
		return Application.modules.Discord.client.users.fetch(userId);
	}
}

module.exports = Application;

/**
 * @template C
 * @typedef { import("./Module")<C> } Module<C>
 */
