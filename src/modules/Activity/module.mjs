import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";
const probability = 0.25;

import config from "../../config/Activity.json" assert { type: "json" };

export const activity = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord

	activitySelect();

	discord.client.on("message", msg => randomizerActivity(msg));

	return { stop };

	async function randomizerActivity(msg) {
		if (
			discord.check_user_access(msg.author)
			&& Tools.chancePercent(probability, true)
		) {
			activitySelect();
		}
	}

	async function activitySelect() {
		if (!discord.is_ready()) {
			return;
		}
		const random = Tools.getRandomIntFromInterval(0, config.activity.length - 1);

		// TODO non-null assert this
		discord.client.user?.setPresence({
			status: "online",
			afk: false,
			activity: {
				name: config.activity[random]
			}
		});
	}
});
