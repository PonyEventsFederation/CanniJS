"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
const probability = 0.25;

module.exports = class Activity extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");
			this.activitySelect();

			Application.modules.Discord.client.on("message", (msg) => {
				this.randomizerActivity(msg);
			});

			return resolve(this);
		});
	}

	randomizerActivity(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author) && Tools.chancePercent(probability, true)) {
			this.activitySelect();
		}
	}

	activitySelect() {
		if (!Application.modules.Discord.isReady()) {
			return;
		}
		const random = Tools.getRandomIntFromInterval(0, this.config.activity.length - 1);
		Application.modules.Discord.client.user.setPresence({
			status: "online",
			afk: false,
			activity: {
				name: this.config.activity[random]
			}
		});
	}


	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
};
