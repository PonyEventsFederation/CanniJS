"use strict";

const Application = require("./Application");
const merge = require("merge");

/**
 * @template C
 * @typedef {{
 *    name: string;
 *    mainPath: string;
 *    rootPath: string;
 *    config: C
 * }} ModuleConfig
 */

/**
 * @template C
 */
module.exports = class Module {
	/**
	 * @param { string } name
	 * @param { C } config
	 */
	constructor(name, config) {
		this.name = name;
		this.config = /** @type { C } */ (merge.recursive({}, config));
		this.log = Application.getLogger(this.name);
	}

	/**
	 * @param { ModuleConfig<C> } module_config
	 */
	constructor_pt_2(module_config) {
		this.moduleConfig = module_config;
	}

	init() {
		return new Promise(resolve => {
			this.log.debug("Initializing...");
			resolve(this);
		});
	}

	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");
			resolve(this);
		});
	}

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			resolve(this);
		});
	}

};
