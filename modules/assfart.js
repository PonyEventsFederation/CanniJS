"use strict";

// @IMPORTS
const Application = require("../lib/Application");
const Module = require("../lib/Module");
const Tools = require("../lib/Tools");

/** @extends { Module<import("./assfart-config.json")> } */
module.exports = class AssFart extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				this.handle(msg);
			});

			return resolve(this);
		});
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	handle(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author) && Tools.msg_contains(msg, "assfart") && !Tools.msg_contains(msg, "is best pony")) {
			return this.assFart(msg);
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	assFart(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.assfartType)) {
			const random = Tools.getRandomIntFromInterval(0, this.config.assfartAnswer.length - 1);
			msg.channel.send(Tools.parseReply(this.config.assfartAnswer[random], msg.author.toString()));

			Application.modules.Discord.setMessageSent();
		}
	}
};
