import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Fanta.json" assert { type: "json" };

export const fanta = define_module(async mi => {
	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author) && Tools.strContainsWord(msg.content, "fanta") && !Tools.msg_contains(msg, "is best pony")) {
			fanta(msg);
		}
	});

	return {
		stop
	};

	async function fanta(msg) {
		if ((await app.modules).discord.control_talked_recently(msg, config.fantaType)) {
			const random = Tools.getRandomIntFromInterval(0, config.fantaAnswers.length - 1);
			msg.channel.send(Tools.parseReply(config.fantaAnswers[random]));

			(await app.modules).discord.set_message_sent();
		}
	}
});

export default class Fanta extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				if (Application.modules.Discord.checkUserAccess(msg.author) && Tools.strContainsWord(msg.content, "fanta") && !Tools.msg_contains(msg, "is best pony")) {
					return this.fanta(msg);
				}
			});

			return resolve(this);
		});
	}

	fanta(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.fantaType)) {
			const random = Tools.getRandomIntFromInterval(0, this.config.fantaAnswers.length - 1);
			msg.channel.send(Tools.parseReply(this.config.fantaAnswers[random]));

			Application.modules.Discord.setMessageSent();
		}
	}

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
}
