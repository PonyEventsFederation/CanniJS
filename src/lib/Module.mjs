import merge from "merge";
import * as tools from "./Tools.mjs";

export default class OldModule {
	constructor(name, config, moduleConfig) {
		this.name = name;
		this.config = merge.recursive({}, config);
		this.log = tools.get_logger(this.name);
		this.moduleConfig = moduleConfig;
	}

	async init() {
		this.log.debug("Initializing...");
	}

	async start() {
		this.log.debug("Starting...");
	}

	async stop() {
		this.log.debug("Stopping...");
	}
}

/**
 * @typedef {{
 *    stop: Stop;
 * }} Module
 * @typedef { () => Promise<void> } Stop
 * @typedef {{
 *    logger: import("tslog").Logger<void>
 * }} ModuleInjects
 */

/**
 * @template { import("./module").Module } T
 * @param { (mi: ModuleInjects) => Promise<T> } mod
 * @return { (mi: ModuleInjects) => Promise<T> }
 */
export function define_module(mod) {
	return async mi => {
		mi.logger.debug("starting...");

		const module = await mod(mi);

		const old_stop = module.stop;
		module.stop = async () => {
			mi.logger.debug("stopping...");
			await old_stop();
		};

		return module;
	};
};

/** @type { (stop: Stop) => Stop } */
export function define_stop(stop) {
	return stop;
};

/** @type { Stop } */
export const stop = Promise.resolve;
