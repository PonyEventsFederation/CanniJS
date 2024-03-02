"use strict";

// @IMPORTS
const Application = require("../lib/Application");
const Module = require("../lib/Module");
const Tools = require("../lib/Tools");

/** @extends { Module<import("./potato-config.json")> } */
module.exports = class Potato extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				this.smartato_emo = Tools.getEmoji(Application.getClient(), "gc_smartato");

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
		if (Tools.msg_contains_list(msg, this.config.phrase_potato)) {
			return this.potato(msg, this.config.potatoType, this.config.ans_potato);
		} else if (Tools.msg_contains_list(msg, this.config.phrase_best_potato)) {
			return this.potato(msg, this.config.bestpotatoType, this.config.ans_best_potato);
		} else if (Tools.msg_contains_list(msg, ["potato", "smartato", "🥔", "🍠"])) {
			return this.potatofy(msg);
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { string } type
	 * @param { Array<string> } answerType
	 */
	potato(msg, type, answerType) {
		if (Application.modules.Discord.controlTalkedRecently(msg, type)) {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			msg.channel.send(Tools.parseReply(answerType[random], msg.author.toString())).then(sentEmbed => {
				this.potatofy(sentEmbed);
			});
			Application.modules.Discord.setMessageSent();
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	potatofy(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author)) {
			msg.react(this.smartato_emo);
		}
	}
};
