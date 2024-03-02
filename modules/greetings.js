"use strict";

// @IMPORTS
const Application = require("../lib/Application");
const Module = require("../lib/Module");
const Tools = require("../lib/Tools");

/** @extends { Module<import("./greetings-config.json")> } */
module.exports = class Greetings extends Module {
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

	/**
	 * @param { import("discord.js").Message } msg
	 */
	handle(msg) {
		if (Tools.msg_contains_list(msg, this.config.phrase_bye_night)) {
			return this.sendMessage(msg, this.config.byenightType, this.config.ans_bye_night);
		} else if (Tools.msg_contains_list(msg, this.config.phrase_bye)) {
			return this.sendMessage(msg, this.config.byeType, this.config.ans_bye);
		} else if (Tools.msg_contains_word_list(msg, this.config.phrase_hello)) {
			return this.sendMessage(msg, this.config.helloType, this.config.ans_hello);
		} else if (Tools.msg_contains_list(msg, this.config.phrase_hello_morning)) {
			return this.sendMessage(msg, this.config.hello_morning_Type, this.config.ans_hello_morning);
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { string } type
	 * @param { Array<string> } answerType
	 */
	sendMessage(msg, type, answerType) {
		if (Application.modules.Discord.controlTalkedRecently(msg, type, false, "channel", undefined, undefined, 90000)) {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			msg.channel.send(Tools.parseReply(answerType[random]));

			Application.modules.Discord.setMessageSent();
		}
	}
};
