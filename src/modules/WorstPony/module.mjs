import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/WorstPony.json" assert { type: "json" };

export const worst_pony = define_module(async mi => {
	(await app.modules).discord.client.on("message", async msg => {
		handle(msg);
	});

	return {
		stop
	};

	function handle(msg) {
		if (msg.author.bot) {
			return;
		}

		if (msg.mentions.has(Application.modules.Discord.client.user)) {
			if (Tools.msg_contains(msg, "i'm sorry") || Tools.msg_contains(msg, "i am sorry") || Tools.msg_contains(msg, "i’m sorry")) {
				return forgiveUser(msg);
			}
		}

		if (Application.modules.Discord.checkUserAccess(msg.author) && Tools.msg_contains(msg, " is worst pony")) {
			return whoIsWorstPony(msg);
		}
	}

	function forgiveUser(msg) {
		if (Application.modules.Discord.isUserBlocked(msg.author.id)) {
			const random = Tools.getRandomIntFromInterval(0, config.forgiveUserAnswer.length - 1);
			msg.channel.send(Tools.parseReply(config.forgiveUserAnswer[random], [msg.author, Application.modules.Discord.getEmoji("gc_cannilove")]));

			Application.modules.Discord.unblockUser(msg.author.id);
		} else {
			const random = Tools.getRandomIntFromInterval(0, config.notSorryAnswer.length - 1);
			msg.channel.send(Tools.parseReply(config.notSorryAnswer[random], [msg.author]));
		}

		Application.modules.Discord.setMessageSent();
	}

	function whoIsWorstPony(msg) {
		switch (msg.content.toLowerCase()) {
		case "canni is worst pony":
		case "canni soda is worst pony": {
			const cooldownMessage = Tools.parseReply(config.cooldownMessageWorstPony, [msg.author]);

			if (Application.modules.Discord.controlTalkedRecently(msg, config.canniWorstPonyType, true, "individual", cooldownMessage, true, config.blockTimeout)) {
				const random = Tools.getRandomIntFromInterval(0, config.canniWorstPonyAnswer.length - 1);
				msg.channel.send(Tools.parseReply(config.canniWorstPonyAnswer[random], [msg.author]));

				Application.modules.Discord.setMessageSent();
			}
			break;
		}
		}
	}
});

export default class WorstPony extends Module {
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
		if (msg.author.bot) {
			return;
		}

		if (msg.mentions.has(Application.modules.Discord.client.user)) {
			if (Tools.msg_contains(msg, "i'm sorry") || Tools.msg_contains(msg, "i am sorry") || Tools.msg_contains(msg, "i’m sorry")) {
				return this.forgiveUser(msg);
			}
		}

		if (Application.modules.Discord.checkUserAccess(msg.author) && Tools.msg_contains(msg, " is worst pony")) {
			return this.whoIsWorstPony(msg);
		}
	}

	forgiveUser(msg) {
		if (Application.modules.Discord.isUserBlocked(msg.author.id)) {
			const random = Tools.getRandomIntFromInterval(0, this.config.forgiveUserAnswer.length - 1);
			msg.channel.send(Tools.parseReply(this.config.forgiveUserAnswer[random], [msg.author, Application.modules.Discord.getEmoji("gc_cannilove")]));

			Application.modules.Discord.unblockUser(msg.author.id);
		} else {
			const random = Tools.getRandomIntFromInterval(0, this.config.notSorryAnswer.length - 1);
			msg.channel.send(Tools.parseReply(this.config.notSorryAnswer[random], [msg.author]));
		}

		Application.modules.Discord.setMessageSent();
	}

	whoIsWorstPony(msg) {
		switch (msg.content.toLowerCase()) {
		case "canni is worst pony":
		case "canni soda is worst pony": {
			const cooldownMessage = Tools.parseReply(this.config.cooldownMessageWorstPony, [msg.author]);

			if (Application.modules.Discord.controlTalkedRecently(msg, this.config.canniWorstPonyType, true, "individual", cooldownMessage, true, this.config.blockTimeout)) {
				const random = Tools.getRandomIntFromInterval(0, this.config.canniWorstPonyAnswer.length - 1);
				msg.channel.send(Tools.parseReply(this.config.canniWorstPonyAnswer[random], [msg.author]));

				Application.modules.Discord.setMessageSent();
			}
			break;
		}
		}
	}

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
}
