"use strict";

const Application = require("./Application");
const merge = require("merge");

/**
 * @template C
 * @typedef {{
 *    name: string;
 *    mainPath: string;
 *    rootPath: string;
 *    config: C;
 *    ftl_bundle: import("@fluent/bundle").FluentBundle;
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

	/**
	 * @param { string } key
	 * @param {{ [k: string]: import("@fluent/bundle").FluentVariable }} [opts]
	 */
	t(key, opts) {
		let msg = this.moduleConfig.ftl_bundle.getMessage(key);
		if (!msg) {
			this.log.error(`no string for ${key} available`);
			return "error: no string found (pinging <@379800645571575810>)"
		}
		return this.moduleConfig.ftl_bundle.formatPattern(msg.value, opts);
	}

	/**
	 * @param { Array<string> } keys
	 * @param {{ [k: string]: import("@fluent/bundle").FluentVariable }} opts
	 */
	randT(keys, opts) {
		let rand = Math.floor(Math.random() * keys.length);
		return this.t(keys[rand], opts);
	}
};
