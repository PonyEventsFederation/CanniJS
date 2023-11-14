"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");
const remote_on = false;
const remote_target = null;

/** @extends { Module<import("../../config/NoMessageProcessor.json")> } */
module.exports = class NoMessageProcessor extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				if (Application.modules.Discord.checkUserAccess(msg.author)) {
					this.handle(msg);
				}
			});

			return resolve(this);
		});
	}

	handle(msg) {
		// When no message was sent, Canni either says she doesn't understand, or boops someone at random if she's not mentioned.
		if (msg.mentions.has(Application.getClient().user)) {
			if (!remote_on || remote_target !== msg.channel) {
				msg.channel.send(Tools.parseReply(this.config.stillLearningAnswer, [Application.modules.Discord.getEmoji("gc_cannishy")]));
			}
		} else {
			const random = Tools.getRandomIntFromInterval(0, 500);
			if (random === 10) {
				msg.channel.send(Tools.parseReply(this.config.randomBoopAnswer, [msg.author]));
			}

			if (random === 42) {
				Application.modules.GamerCanni.letsPlay(msg, this.config.playGameAnswer);
			}
		}
	}
};
