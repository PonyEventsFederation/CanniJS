"use strict";

const Application = require("./Application");
const merge = require("merge");

module.exports = class Module {
	/**
	 * @param { string } name
	 * @param { any } config
	 * @param { any } moduleConfig
	 */
	constructor(name, config, moduleConfig) {
		this.name = name;
		this.config = merge.recursive({}, config);
		this.log = Application.getLogger(this.name);
		this.moduleConfig = moduleConfig;
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
