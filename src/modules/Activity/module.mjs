import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";
const probability = 0.25;

import config from "../../config/Activity.json" assert { type: "json" };

export const activity = define_module(async mi => {
	activitySelect();

	(await app.modules).discord.client.on("message", msg => {
		randomizerActivity(msg);
	});

	return {
		stop
	};

	async function randomizerActivity(msg) {
		if (
			(await app.modules).discord.check_user_access(msg.author)
			&& Tools.chancePercent(probability, true)
		) {
			activitySelect();
		}
	}

	function activitySelect() {
		if (!Application.modules.Discord.isReady()) {
			return;
		}
		const random = Tools.getRandomIntFromInterval(0, config.activity.length - 1);
		Application.modules.Discord.client.user.setPresence({
			status: "online",
			afk: false,
			activity: {
				name: config.activity[random]
			}
		});
	}
});

export default class Activity extends Module {
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
}
