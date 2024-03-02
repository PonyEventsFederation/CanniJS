"use strict";

// @IMPORTS
const Application = require("../lib/Application");
const Module = require("../lib/Module");
const Tools = require("../lib/Tools");
const probability = 0.25;

// throttler for randomising activity
// okay_to_change is set to false when reset_wait is called, and refreshes timeout,
// which after 15mins will change okay_to_change back to true
let okay_to_change = true;
let timeout = setTimeout(() => okay_to_change = true, 15 * 60_000);

function reset_wait() {
	okay_to_change = false;
	timeout.refresh();
}

/** @extends { Module<import("./activity-config.json")> } */
module.exports = class Activity extends Module {
	/** @override */
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

	/**
	 * @param { import("discord.js").Message } msg
	 */
	randomizerActivity(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author) && okay_to_change && Tools.chancePercent(probability, true)) {
			this.activitySelect();
		}
	}

	activitySelect() {
		reset_wait();

		const random = Tools.getRandomIntFromInterval(0, this.config.activity.length - 1);
		const activity = this.config.activity[random];
		Application.modules.Discord.client.user.setPresence({
			status: "online",
			afk: false,
			activity: { name: activity }
		}).then(() => this.log.info(`set activity to ${activity}`)).catch(console.error);
	}
};
