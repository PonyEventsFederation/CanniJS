import fs from "fs";
import merge from "merge";
import { EventEmitter } from "events";
import Tools from "./Tools.mjs";
import * as tools from "./Tools.mjs";
const emitterInstance = new EventEmitter();

// const Application = {
// 	emitter: new EventEmitter(),
// 	stop() {
// 		return new Promise(() => {
// 			return Application.stopModules().then(() => {
// 				this.emitter.emit("stop");
// 				// i needed an event, its used in the solver module
// 				// to know when to remove worker pool
// 			}, (err) => {
// 				this.log.error(err);
// 				process.exit(1);
// 			});
// 		});
// 	},
//
// 	/**
// 	 * @param { any } config
// 	 */
// 	configure(config) {
// 		if (config.stage) {
// 			config.stage = config.stage.toLowerCase();
// 		}
//
// 		this.config = merge.recursive({
// 			logformat: "dddd, MMMM Do YYYY, h:mm:ss a",
// 			logLevelConsole: "debug",
// 			logDisabled: false,
// 			quiet: false
// 		}, config);
// 		this.moduleObjs = [];
// 		this.modules = {};
//
// 		this.log = this.getLogger("application");
// 		this.scriptName = null;
//
// 		process.on("uncaughtException", (err) => {
// 			this.log.error(err);
// 			process.exit(1);
// 		});
// 	},
//
// 	/**
// 	 * @return { boolean }
// 	 */
// 	isDev() {
// 		return this.config.stage === "dev" || this.config.stage === "development";
// 	},
//
// 	/**
// 	 * @return { boolean }
// 	 */
// 	isProd() {
// 		return this.config.stage === "prod" || this.config.stage === "production";
// 	},
//
// 	/**
// 	 * @return { boolean }
// 	 */
// 	isRunning() {
// 		return this.running || false;
// 	},
//
// 	/**
// 	 * @param { string } name
// 	 */
// 	getLogger(name) {
// 		// let transports = [];
// 		// if (!Application.config.logDisabled) {
// 		// 	transports = [
// 		// 		new winston.transports.Console({
// 		// 			level: Application.config.logLevelConsole,
// 		// 			colorize: true,
// 		// 			json: false,
// 		// 			label: name.toUpperCase(),
// 		// 			timestamp: () => {
// 		// 				return moment().format(this.config.logformat);
// 		// 			}
// 		// 		})
// 		// 	];
//
// 		// }
//
// 		// return new (winston.Logger)({
// 		// 	transports: transports
// 		// });
// 		return tools.get_logger(name);
// 	},
//
// 	/**
// 	 * @param { string } moduleName
// 	 */
// 	loadModuleConfig(moduleName) {
// 		const configJsonLocation = this.config.config_path + "/" + moduleName + ".json";
// 		const localConfigJsonLocation = this.config.config_path + "/" + moduleName + ".local.json";
// 		let localConfig = {};
//
// 		if (!fs.existsSync(configJsonLocation)) {
// 			fs.writeFileSync(configJsonLocation, "{}");
// 		}
//
// 		try {
// 			let config = Tools.loadCommentedConfigFile(configJsonLocation);
// 			let stagedConfig = {};
// 			let configHasStages = false;
//
// 			for (const stage of this.config.stages) {
// 				if (config[stage]) {
// 					configHasStages = true;
// 					stagedConfig = merge.recursive(stagedConfig, config[stage]);
// 				}
//
// 				if (stage == this.config.stage) {
// 					break;
// 				}
//
// 				// env
//
// 				if (fs.existsSync(localConfigJsonLocation)) {
// 					localConfig = Tools.loadCommentedConfigFile(localConfigJsonLocation);
// 				}
//
// 				if (!configHasStages) {
// 					config = merge.recursive(config, localConfig);
// 					return config;
// 				} else {
// 					stagedConfig = merge.recursive(stagedConfig, localConfig);
// 					return stagedConfig;
// 				}
// 			}
// 		} catch (e) {
// 			throw new Error(`config of module ${moduleName} contains invalid json data: ${e}`);
// 		}
// 	},
//
// 	/**
// 	 * @param { string } moduleName
// 	 */
// 	async registerModule(moduleName) {
// 		const mainModuleFile = this.config.modules_path + "/" + moduleName + "/module.mjs";
//
// 		if (!fs.existsSync(mainModuleFile)) {
// 			throw new Error("Missing module.mjs for module " + moduleName);
// 		}
//
// 		const moduleConfig = this.loadModuleConfig(moduleName);
//
// 		const moduleObj = {
// 			name: moduleName,
// 			mainPath: mainModuleFile,
// 			rootPath: this.config.modules_path + "/" + moduleName,
// 			config: moduleConfig
// 		};
//
// 		const moduleClass = await import(mainModuleFile);
// 		const moduleInstance = new moduleClass.default(moduleName, moduleConfig, moduleObj);
//
// 		moduleObj.instance = moduleInstance;
//
// 		this.moduleObjs.push(moduleObj);
// 		this.modules[moduleName] = moduleInstance;
//
// 		return moduleInstance;
// 	},
//
// 	async initModules() {
// 		this.log.info("Initializing Modules");
//
// 		for (const moduleObj of this.moduleObjs) {
// 			await moduleObj.instance.init();
// 		}
// 	},
//
// 	async startModules() {
// 		this.log.info("Starting Modules");
//
// 		for (const moduleObj of this.moduleObjs) {
// 			await moduleObj.instance.start();
// 		}
// 	},
//
// 	stopModules() {
// 		return new Promise((resolve, reject) => {
// 			this.log.info("Stopping Modules");
//
// 			Promise.all(this.moduleObjs.map(moduleObj => moduleObj.instance.stop())).then(() => {
// 				this.moduleObjs = null;
// 				this.modules = null;
// 				// @ts-expect-error
// 				resolve();
// 			}).catch(reject);
// 		});
// 	},
//
// 	loadApplicationConfigs() {
// 		const rootDir = Application.config.config_path + "/application";
// 		const files = fs.readdirSync(rootDir);
// 		const applicationConfig = {};
//
// 		for (const file of files) {
// 			if (file == ".gitkeep") {
// 				continue;
// 			}
// 			const config = Tools.loadCommentedConfigFile(rootDir + "/" + file);
//
// 			applicationConfig[file.replace(/^(.*?)\.json$/, "$1")] = config;
// 		}
//
// 		this.appConfigs = applicationConfig;
// 	},
//
// 	async run() {
// 		await this.loadApplicationConfigs();
// 		await this.initModules();
// 		await this.startModules();
//
// 		this.log.info("Application started");
//
// 		this.running = true;
// 	},
//
// 	/** @type {import("events").EventEmitter["on"]} */
// 	on() {
// 		// @ts-expect-error
// 		return emitterInstance.on.apply(this, arguments);
// 	},
//
// 	/** @type {import("events").EventEmitter["emit"]} */
// 	emit() {
// 		// @ts-expect-error
// 		return emitterInstance.emit.apply(this, arguments);
// 	},
//
// 	/**
// 	 * @param { string } id
// 	 */
// 	checkSelf(id) {
// 		return id === this.getClientId();
// 	},
//
// 	/**
// 	 * @return { import("discord.js").Client }
// 	 */
// 	getClient() {
// 		return Application.modules.Discord.client;
// 	},
//
// 	/**
// 	 * @return { string }
// 	 */
// 	getClientId() {
// 		return Application.modules.Discord.client.user.id;
// 	},
//
// 	/**
// 	 * @param { string } userId
// 	 * @return {import("discord.js").User}
// 	 */
// 	getUser(userId) {
// 		return Application.modules.Discord.client.users.fetch(userId);
// 	}
// };
//
// export default Application;

import { activity } from "../modules/activity.mjs";
import { assfart } from "../modules/assfart.mjs";
import { bap } from "../modules/bap.mjs";
import { best_pony } from "../modules/best_pony.mjs";
import { bizaam } from "../modules/bizaam.mjs";
import { boop } from "../modules/boop.mjs";
import { compliment } from "../modules/compliment.mjs";
import { dev_commands } from "../modules/dev_commands.mjs";
import { discord } from "../modules/discord.mjs";
import { fanta } from "../modules/fanta.mjs";
import { gamer_canni } from "../modules/gamer_canni.mjs";
import { greetings } from "../modules/greetings.mjs";
import { help } from "../modules/help.mjs";
import { holiday } from "../modules/holiday.mjs";
import { hug } from "../modules/hug.mjs";
import { hype } from "../modules/hype.mjs";
import { ignore } from "../modules/ignore.mjs";
import { inter_bot_com } from "../modules/inter_bot_com.mjs";
import { mention_canni } from "../modules/mention_canni.mjs";
import { no_message_processor } from "../modules/no_message_processor.mjs";
import { overload } from "../modules/overload.mjs";
import { potato } from "../modules/potato.mjs";
import { routine_messages } from "../modules/routine_messages.mjs";
import { solver } from "../modules/solver.mjs";
import { time_to_galacon } from "../modules/time_to_galacon.mjs";
import { user_joined } from "../modules/user_joined.mjs";
import { worst_pony } from "../modules/worst_pony.mjs";

/**
 * @satisfies {Record<
 *    string,
 *    (mi: import("./module.js").ModuleInjects) => Promise<import("./module.js").Module>
 * >}
 */
const uninitialised_modules = {
	activity,
	assfart,
	bap,
	best_pony,
	bizaam,
	boop,
	compliment,
	dev_commands,
	discord,
	fanta,
	gamer_canni,
	greetings,
	help,
	holiday,
	hug,
	hype,
	ignore,
	inter_bot_com,
	mention_canni,
	no_message_processor,
	overload,
	potato,
	routine_messages,
	solver,
	time_to_galacon,
	user_joined,
	worst_pony
};

/** @type {() => void} */
let module_start;
/** @type {() => Promise<void>} */
let module_stop;
let started = false;

export let modules = create_modules_promise();

/**
 * @return {Promise<ReturnType<
 *    typeof init_modules<keyof uninitialised_modules, uninitialised_modules>
 * >>}
 */
function create_modules_promise() {
	/**
	 * @type {Promise<{
	 *    [K in keyof typeof uninitialised_modules]: ReturnType<uninitialised_modules[K]>
	 * }>}
	 */
	const promise = new Promise(res => {
		module_start = () => {
			started = true;
			const modules = init_modules(uninitialised_modules);
			res(modules);
		};
		module_stop = async () => {
			for (const [, module] of tools.entries(await modules)) {
				await (await module).stop();
			}

			modules = create_modules_promise();
			started = false;
		};
	});
	return promise;
}

/**
 * @template {string} ModuleNames
 * @template {{
 *    [K in ModuleNames]: (mi: import("./module.js").ModuleInjects)
 *       => Promise<import("./module.js").Module>
 * }} T
 * @param {T} modules
 * @return {{ [K in keyof T]: ReturnType<T[K]>}}
 */
function init_modules(modules) {
	/** @type {{ [K in keyof T]: ReturnType<T[K]> }} */
	// @ts-expect-error properties will be added later
	const initialised_modules = {};

	const entries = tools.entries(modules);
	for (const [name, module] of entries) {
		const logger = tools.get_logger(/** @type {string} */ (name));
		const ignore_promise = tools._ignore_promise(logger);
		/** @type {import("./module.js").ModuleInjects} */
		const mi = { logger, ignore_promise };

		// @ts-expect-error typescript is complaining
		initialised_modules[name] = module(mi);
	}

	return initialised_modules;
}

export function start_app() {
	if (started) return;
	module_start();
}

export async function stop_app() {
	if (!started) return;
	await module_stop();
}

export async function restart_app() {
	if (started) await module_stop();
	module_start();
}
