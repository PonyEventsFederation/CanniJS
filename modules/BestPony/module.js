"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");

module.exports = class BestPony extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				if (Application.modules.Discord.checkUserAccess(msg.author) && Tools.msg_contains(msg, " is best pony")) {
					return this.handle(msg);
				}
			});

			return resolve(this);
		});
	}

	handle(msg) {
		if (Tools.msg_contains(msg, "who is best pony")) {
			this.whoIsBestPony(msg, this.config.bestPonyType, this.config.bestPonyAnswer1, "gc_cannibizaam");
		} else if (Tools.msg_contains(msg, "canni is best pony") || Tools.msg_contains(msg, "canni soda is best pony")) {
			this.whoIsBestPony(msg, this.config.canniBestPonyType, this.config.bestPonyAnswer2);
		} else if (/b+i+z+a+m+ is best pony/i.test(msg.content)) {
			this.whoIsBestPony(msg, this.config.bizaamBestPonyType, this.config.bestPonyAnswer3);
		} else if (Tools.msg_contains(msg, "assfart is best pony")) {
			this.whoIsBestPony(msg, this.config.assFartBestPonyType, this.config.bestPonyAnswer4);
		} else if (Tools.msg_contains(msg, "fanta is best pony")) {
			this.whoIsBestPony(msg, this.config.fantaBestPony, this.config.bestPonyAnswer5);
		} else {
			this.whoIsBestPony(msg, this.config.interjectType, this.config.bestPonyAnswerDefault);
		}
	}

	whoIsBestPony(msg, type, answers, emoji = "") {
		if (Application.modules.Discord.controlTalkedRecently(msg, type)) {
			const random = Tools.getRandomIntFromInterval(0, answers.length - 1);
			msg.channel.send(Tools.parseReply(answers[random], [msg.author, Application.modules.Discord.getEmoji(emoji)]));

			Application.modules.Discord.setMessageSent();
		}
	}

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
};
