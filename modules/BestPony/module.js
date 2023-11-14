"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");

/** @extends { Module<import("../../config/BestPony.json")> } */
module.exports = class BestPony extends Module {
	/** @override */
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

	/**
	 * @param { import("discord.js").Message } msg
	 */
	handle(msg) {
		if (Tools.msg_contains(msg, "who is best pony")) {
			return this.whoIsBestPony(msg, this.config.who, this.config.who_answer, "gc_cannibizaam");
		}

		if (Tools.msg_contains(msg, "canni is best pony") || Tools.msg_contains(msg, "canni soda is best pony")) {
			return this.whoIsBestPony(msg, this.config.canni, this.config.canni_answer);
		}

		if (/b+i+z+a+m+ is best pony/i.test(msg.content)) {
			return this.whoIsBestPony(msg, this.config.bizaam, this.config.bizaam_answer);
		}

		if (Tools.msg_contains(msg, "assfart is best pony")) {
			return this.whoIsBestPony(msg, this.config.assfart, this.config.assfart_answer);
		}

		if (Tools.msg_contains(msg, "fanta is best pony")) {
			return this.whoIsBestPony(msg, this.config.fanta, this.config.fanta_answer);
		}

		this.whoIsBestPony(msg, this.config.interject, this.config.interject_answer);
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { string } type
	 * @param { Array<string> } answers
	 * @param { string } emoji
	 */
	whoIsBestPony(msg, type, answers, emoji = "") {
		if (Application.modules.Discord.controlTalkedRecently(msg, type)) {
			const random = Tools.getRandomIntFromInterval(0, answers.length - 1);

			msg.channel.send(Tools.parseReply(
				answers[random],
				msg.author.toString(),
				Application.modules.Discord.getEmoji(emoji).toString()
			));

			Application.modules.Discord.setMessageSent();
		}
	}
};
