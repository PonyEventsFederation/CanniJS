"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");
const probability = 0.25;

let okay_to_change = true;
// 15 mins
let timeout = setTimeout(() => okay_to_change = true, 15 * 60_000);

function reset_wait() {
	okay_to_change = false;
	timeout.refresh();
}

module.exports = class Activity extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				this.randomizerActivity(msg);
			});
			Application.modules.Discord.client.on("ready", () => {
				this.activitySelect();
			});

			return resolve(this);
		});
	}

	randomizerActivity(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author) && okay_to_change && Tools.chancePercent(probability, true)) {
			this.activitySelect();
		}
	}

	activitySelect() {
		reset_wait();

		const random = Tools.getRandomIntFromInterval(0, this.config.activity.length - 1);
		const activity = this.config.activity[random];
		Application.modules.Discord.client.user.setActivity(activity, {
			status: "online",
			afk: false
		}).then(() => this.log.info(`set activity to ${activity}`)).catch(console.error);
	}


	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
};
