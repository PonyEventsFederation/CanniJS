import fs from "fs";
import merge from "merge";
import { EventEmitter } from "events";
import Tools from "./Tools.mjs";
import * as tools from "./Tools.mjs";
const emitterInstance = new EventEmitter();

const Application = {
	emitter: new EventEmitter(),
	stop() {
		return new Promise(() => {
			return Application.stopModules().then(() => {
				this.emitter.emit("stop");
				// i needed an event, its used in the solver module
				// to know when to remove worker pool
			}, (err) => {
				// @ts-expect-error
				this.log.error(err);
				process.exit(1);
			});
		});
	},

	/**
	 * @param { any } config
	 */
	configure(config) {
		if (config.stage) {
			config.stage = config.stage.toLowerCase();
		}

		// @ts-expect-error
		this.config = merge.recursive({
			logformat: "dddd, MMMM Do YYYY, h:mm:ss a",
			logLevelConsole: "debug",
			logDisabled: false,
			quiet: false
		}, config);
		// @ts-expect-error
		this.moduleObjs = [];
		// @ts-expect-error
		this.modules = {};

		// @ts-expect-error
		this.log = this.getLogger("application");
		// @ts-expect-error
		this.scriptName = null;

		process.on("uncaughtException", (err) => {
			// @ts-expect-error
			this.log.error(err);
			process.exit(1);
		});
	},

	/**
	 * @return { boolean }
	 */
	isDev() {
		// @ts-expect-error
		return this.config.stage === "dev" || this.config.stage === "development";
	},

	/**
	 * @return { boolean }
	 */
	isProd() {
		// @ts-expect-error
		return this.config.stage === "prod" || this.config.stage === "production";
	},

	/**
	 * @return { boolean }
	 */
	isRunning() {
		// @ts-expect-error
		return this.running || false;
	},

	/**
	 * @param { string } name
	 */
	getLogger(name) {
		// let transports = [];
		// if (!Application.config.logDisabled) {
		// 	transports = [
		// 		new winston.transports.Console({
		// 			level: Application.config.logLevelConsole,
		// 			colorize: true,
		// 			json: false,
		// 			label: name.toUpperCase(),
		// 			timestamp: () => {
		// 				return moment().format(this.config.logformat);
		// 			}
		// 		})
		// 	];

		// }

		// return new (winston.Logger)({
		// 	transports: transports
		// });
		return tools.get_logger(name);
	},

	/**
	 * @param { string } moduleName
	 */
	loadModuleConfig(moduleName) {
		// @ts-expect-error
		const configJsonLocation = this.config.config_path + "/" + moduleName + ".json";
		// @ts-expect-error
		const localConfigJsonLocation = this.config.config_path + "/" + moduleName + ".local.json";
		let localConfig = {};

		if (!fs.existsSync(configJsonLocation)) {
			fs.writeFileSync(configJsonLocation, "{}");
		}

		try {
			let config = Tools.loadCommentedConfigFile(configJsonLocation);
			let stagedConfig = {};
			let configHasStages = false;

			// @ts-expect-error
			for (const stage of this.config.stages) {
				if (config[stage]) {
					configHasStages = true;
					stagedConfig = merge.recursive(stagedConfig, config[stage]);
				}

				// @ts-expect-error
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
			throw new Error(`config of module ${moduleName} contains invalid json data: ${e}`);
		}
	},

	/**
	 * @param { string } moduleName
	 */
	async registerModule(moduleName) {
		// @ts-expect-error
		const mainModuleFile = this.config.modules_path + "/" + moduleName + "/module.mjs";

		if (!fs.existsSync(mainModuleFile)) {
			throw new Error("Missing module.mjs for module " + moduleName);
		}

		const moduleConfig = this.loadModuleConfig(moduleName);

		const moduleObj = {
			name: moduleName,
			mainPath: mainModuleFile,
			// @ts-expect-error
			rootPath: this.config.modules_path + "/" + moduleName,
			config: moduleConfig
		};

		const moduleClass = await import(mainModuleFile);
		const moduleInstance = new moduleClass.default(moduleName, moduleConfig, moduleObj);

		// @ts-expect-error
		moduleObj.instance = moduleInstance;

		// @ts-expect-error
		this.moduleObjs.push(moduleObj);
		// @ts-expect-error
		this.modules[moduleName] = moduleInstance;

		return moduleInstance;
	},

	async initModules() {
		// @ts-expect-error
		this.log.info("Initializing Modules");

		// @ts-expect-error
		for (const moduleObj of this.moduleObjs) {
			await moduleObj.instance.init();
		}
	},

	async startModules() {
		// @ts-expect-error
		this.log.info("Starting Modules");

		// @ts-expect-error
		for (const moduleObj of this.moduleObjs) {
			await moduleObj.instance.start();
		}
	},

	stopModules() {
		return new Promise((resolve, reject) => {
			// @ts-expect-error
			this.log.info("Stopping Modules");

			// @ts-expect-error
			Promise.all(this.moduleObjs.map(moduleObj => moduleObj.instance.stop())).then(() => {
				// @ts-expect-error
				this.moduleObjs = null;
				// @ts-expect-error
				this.modules = null;
				// @ts-expect-error
				resolve();
			}).catch(reject);
		});
	},

	loadApplicationConfigs() {
		// @ts-expect-error
		const rootDir = Application.config.config_path + "/application";
		const files = fs.readdirSync(rootDir);
		const applicationConfig = {};

		for (const file of files) {
			if (file == ".gitkeep") {
				continue;
			}
			const config = Tools.loadCommentedConfigFile(rootDir + "/" + file);

			// @ts-expect-error
			applicationConfig[file.replace(/^(.*?)\.json$/, "$1")] = config;
		}

		// @ts-expect-error
		this.appConfigs = applicationConfig;
	},

	async run() {
		await this.loadApplicationConfigs();
		await this.initModules();
		await this.startModules();

		// @ts-expect-error
		this.log.info("Application started");

		// @ts-expect-error
		this.running = true;
	},

	/** @type {import("events").EventEmitter["on"]} */
	on() {
		// @ts-expect-error
		return emitterInstance.on.apply(this, arguments);
	},

	/** @type {import("events").EventEmitter["emit"]} */
	emit() {
		// @ts-expect-error
		return emitterInstance.emit.apply(this, arguments);
	},

	/**
	 * @param { string } id
	 */
	checkSelf(id) {
		return id === this.getClientId();
	},

	/**
	 * @return { import("discord.js").Client }
	 */
	getClient() {
		// @ts-expect-error
		return Application.modules.Discord.client;
	},

	/**
	 * @return { string }
	 */
	getClientId() {
		// @ts-expect-error
		return Application.modules.Discord.client.user.id;
	},

	/**
	 * @param { string } userId
	 * @return {import("discord.js").User}
	 */
	getUser(userId) {
		// @ts-expect-error
		return Application.modules.Discord.client.users.fetch(userId);
	}
};

export default Application;

/**
 * @satisfies { Record<
 *    string, (
 *    mi: import("./module").ModuleInjects) => import("./module").Module
 * > }
 */
const uninitialised_modules = {};

export const modules = init_modules(uninitialised_modules);

/**
 * @template { string } ModuleNames
 * @template {{
 *    [K in ModuleNames]: (mi: import("./module").ModuleInjects) => import("./module").Module
 * }} T
 * @param { T } modules
 * @return {{ [K in keyof T]: ReturnType<T[K]> }}
 */
function init_modules(modules) {
	/** @type {{ [K in keyof T]: ReturnType<T[K]> }} */
	// @ts-expect-error
	const initialised_modules = {};

	tools.entries(modules)
		.forEach(([name, module]) => {
			/** @type { import("./module").ModuleInjects } */
			const mi = {
				logger: tools.get_logger(/** @type { string } */ (name))
			};

			// @ts-expect-error
			initialised_modules[name] = module(mi);
		});

	return initialised_modules;
}
