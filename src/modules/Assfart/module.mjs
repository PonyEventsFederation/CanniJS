import * as app from "../../lib/Application.mjs";
import Application from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Assfart.json" assert { type: "json" };

export const assfart = define_module(async mi => {
	(await app.modules).discord.client.on("message", msg => {
		handle(msg);
	});

	return {
		stop
	};

	function handle(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author) && Tools.msg_contains(msg, "assfart") && !Tools.msg_contains(msg, "is best pony")) {
			return assFart(msg);
		}
	}

	function assFart(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, config.assfartType)) {
			const random = Tools.getRandomIntFromInterval(0, config.assfartAnswer.length - 1);
			msg.channel.send(Tools.parseReply(config.assfartAnswer[random], [msg.author]));

			Application.modules.Discord.setMessageSent();
		}
	}
});

export default class AssFart extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				this.handle(msg);
			});

			return resolve(this);
		});
	}

	handle(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author) && Tools.msg_contains(msg, "assfart") && !Tools.msg_contains(msg, "is best pony")) {
			return this.assFart(msg);
		}
	}

	assFart(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.assfartType)) {
			const random = Tools.getRandomIntFromInterval(0, this.config.assfartAnswer.length - 1);
			msg.channel.send(Tools.parseReply(this.config.assfartAnswer[random], [msg.author]));

			Application.modules.Discord.setMessageSent();
		}
	}

	stop() {
		return new Promise((resolve) => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
}
