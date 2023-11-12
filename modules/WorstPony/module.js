"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");

module.exports = class WorstPony extends Module {
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
};
