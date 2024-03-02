"use strict";

const Application = require("./Application");
const Tools = require("./Tools");
const merge = require("merge");

/**
 * @template C
 * @typedef {{
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
	 * @param { ModuleConfig<C> } module_config
	 */
	constructor(name, config, module_config) {
		this.name = name;
		this.config = /** @type { C } */ (merge.recursive({}, config));
		this.log = Application.getLogger(this.name);
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
			return "error: no string found, please report";
		}
		return this.moduleConfig.ftl_bundle.formatPattern(msg.value, opts);
	}

	/**
	 * @param { Array<string> } keys
	 * @param {{ [k: string]: import("@fluent/bundle").FluentVariable }} [opts]
	 */
	randT(keys, opts) {
		let rand = Math.floor(Math.random() * keys.length);
		return this.t(keys[rand], opts);
	}

	/**
	 * @param { object } o
	 * @param { string } o.key_prefix
	 * @param { number } o.range_start
	 * @param { number } o.range_end_inclusive
	 * @param {{ [k: string]: import("@fluent/bundle").FluentVariable }} [o.opts]
	 */
	tRange({
		key_prefix,
		range_start,
		range_end_inclusive,
		opts
	}) {
		const rand = Tools.rand_int_inclusive_from_interval2(range_start, range_end_inclusive);
		const key = `${key_prefix}-${rand}`;
		return this.t(key, opts);
	}
};
