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

		this.config = merge.recursive({
			logformat: "dddd, MMMM Do YYYY, h:mm:ss a",
			logLevelConsole: "debug",
			logDisabled: false,
			quiet: false
		}, config);
		this.moduleObjs = [];
		this.modules = {};

		this.log = this.getLogger("application");
		this.scriptName = null;

		process.on("uncaughtException", (err) => {
			this.log.error(err);
			process.exit(1);
		});
	},

	/**
	 * @return { boolean }
	 */
	isDev() {
		return this.config.stage === "dev" || this.config.stage === "development";
	},

	/**
	 * @return { boolean }
	 */
	isProd() {
		return this.config.stage === "prod" || this.config.stage === "production";
	},

	/**
	 * @return { boolean }
	 */
	isRunning() {
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

			for (const stage of this.config.stages) {
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
			throw new Error(`config of module ${moduleName} contains invalid json data: ${e}`);
		}
	},

	/**
	 * @param { string } moduleName
	 */
	async registerModule(moduleName) {
		const mainModuleFile = this.config.modules_path + "/" + moduleName + "/module.mjs";

		if (!fs.existsSync(mainModuleFile)) {
			throw new Error("Missing module.mjs for module " + moduleName);
		}

		const moduleConfig = this.loadModuleConfig(moduleName);

		const moduleObj = {
			name: moduleName,
			mainPath: mainModuleFile,
			rootPath: this.config.modules_path + "/" + moduleName,
			config: moduleConfig
		};

		const moduleClass = await import(mainModuleFile);
		const moduleInstance = new moduleClass.default(moduleName, moduleConfig, moduleObj);

		moduleObj.instance = moduleInstance;

		this.moduleObjs.push(moduleObj);
		this.modules[moduleName] = moduleInstance;

		return moduleInstance;
	},

	async initModules() {
		this.log.info("Initializing Modules");

		for (const moduleObj of this.moduleObjs) {
			await moduleObj.instance.init();
		}
	},

	async startModules() {
		this.log.info("Starting Modules");

		for (const moduleObj of this.moduleObjs) {
			await moduleObj.instance.start();
		}
	},

	stopModules() {
		return new Promise((resolve, reject) => {
			this.log.info("Stopping Modules");

			Promise.all(this.moduleObjs.map(moduleObj => moduleObj.instance.stop())).then(() => {
				this.moduleObjs = null;
				this.modules = null;
				// @ts-expect-error
				resolve();
			}).catch(reject);
		});
	},

	loadApplicationConfigs() {
		const rootDir = Application.config.config_path + "/application";
		const files = fs.readdirSync(rootDir);
		const applicationConfig = {};

		for (const file of files) {
			if (file == ".gitkeep") {
				continue;
			}
			const config = Tools.loadCommentedConfigFile(rootDir + "/" + file);

			applicationConfig[file.replace(/^(.*?)\.json$/, "$1")] = config;
		}

		this.appConfigs = applicationConfig;
	},

	async run() {
		await this.loadApplicationConfigs();
		await this.initModules();
		await this.startModules();

		this.log.info("Application started");

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
		return Application.modules.Discord.client;
	},

	/**
	 * @return { string }
	 */
	getClientId() {
		return Application.modules.Discord.client.user.id;
	},

	/**
	 * @param { string } userId
	 * @return {import("discord.js").User}
	 */
	getUser(userId) {
		return Application.modules.Discord.client.users.fetch(userId);
	}
};

export default Application;

/**
 * @satisfies { Record<
 *    string,
 *    (mi: import("./module").ModuleInjects) => Promise<import("./module").Module>
 * > }
 */
const uninitialised_modules = {
	thing: async () => ({
		stop,
		thing: () => 3,
		other_thing: () => Symbol()
	})
};

/** @type { () => Promise<void> } */
let module_start;
/** @type { () => Promise<void> } */
let module_stop;
let started = false;

export let modules = create_modules_promise();

/**
 * @return { ReturnType<typeof init_modules<keyof uninitialised_modules, uninitialised_modules>> }
 */
function create_modules_promise() {
	return new Promise(res => {
		module_start = async () => {
			started = true;
			const modules = await init_modules(uninitialised_modules);
			res(modules);
		};
		module_stop = async () => {
			for (const [_name, module] of tools.entries(await modules)) {
				await module.stop();
			}

			modules = create_modules_promise();
			started = false;
		};
	});
}

/**
 * @template { string } ModuleNames
 * @template {{
 *    [K in ModuleNames]: (mi: import("./module").ModuleInjects)
 *       => Promise<import("./module").Module>
 * }} T
 * @param { T } modules
 * @return { Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> }
 */
async function init_modules(modules) {
	/** @type {{ [K in keyof T]: Awaited<ReturnType<T[K]>> }} */
	// @ts-expect-error
	const initialised_modules = {};

	const entries = tools.entries(modules);
	for (const [name, module] of entries) {
		/** @type { import("./module").ModuleInjects } */
		const mi = {
			logger: tools.get_logger(/** @type { string } */ (name))
		};

		// @ts-expect-error
		initialised_modules[name] = await module(mi);
	}

	return initialised_modules;
}

export async function start_app() {
	if (started) return;
	await module_start();
}

export async function stop_app() {
	if (!started) return;
	await module_stop();
}

export async function restart_app() {
	if (started) await module_stop();
	await module_start();
}
