import merge from "merge";
import * as tools from "./Tools.mjs";

export default class Module {
	// @ts-expect-error
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
 *    start: () => Promise<void>;
 *    stop: () => Promise<void>;
 * }} ModuleLifecycle
 *
 * @typedef {{
 *    logger: import("tslog").Logger<void>
 * }} ModuleInjects
 */

/**
 * @template C
 * @template M
 * @typedef { (cfg: C, injects: ModuleInjects) => M & ModuleLifecycle } ModuleInnerConstructor
 */

/**
 * @template C
 * @template M
 * @param { ModuleInnerConstructor<C, M> } module
 * @return { ModuleInnerConstructor<C, M> }
 */
export function define_module(module) {
	return module;
}
