"use strict";

// @IMPORTS
const Application = require("../lib/Application");
const Module = require("../lib/Module");
const Tools = require("../lib/Tools");

/** @extends { Module<import("./fanta-config.json")> } */
module.exports = class Fanta extends Module {
	/** @override */
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

	/**
	 * @param { import("discord.js").Message } msg
	 */
	fanta(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.fantaType)) {
			const random = Tools.getRandomIntFromInterval(0, this.config.fantaAnswers.length - 1);
			msg.channel.send(Tools.parseReply(this.config.fantaAnswers[random]));

			Application.modules.Discord.setMessageSent();
		}
	}
};
