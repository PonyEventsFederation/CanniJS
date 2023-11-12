"use strict";
// @IMPORTS
const Application = require("./Application");
const merge = require("merge");

module.exports = class Module {

	constructor(name, config, moduleConfig) {
		this.name = name;
		this.config = merge.recursive({}, config);
		this.log = Application.getLogger(this.name);
		this.moduleConfig = moduleConfig;
	}

	/*
     LIFECYCLE
     */

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
