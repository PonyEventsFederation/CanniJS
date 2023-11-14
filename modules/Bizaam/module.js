"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");

/** @extends { Module<import("../../config/Bizaam.json")> } */
module.exports = class Bizaam extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				this.bizaamEmoji = Application.modules.Discord.getEmoji("gc_cannibizaam");

				if (Application.modules.Discord.checkUserAccess(msg.author) && /\bb+i+z+a+m+\b/i.test(msg.content) && !Tools.msg_contains(msg, "is best pony")) {
					return this.bizaam(msg);
				}
			});

			return resolve(this);
		});
	}

	bizaam(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.bizaamType)) {
			const random = Tools.getRandomIntFromInterval(0, this.config.bizaamAnswer.length - 1);
			msg.channel.send(Tools.parseReply(this.config.bizaamAnswer[random], [this.bizaamEmoji])).then(sentEmbed => {
				sentEmbed.react(this.bizaamEmoji);
			});

			Application.modules.Discord.setMessageSent();
		}
	}
};
