"use strict";

// @IMPORTS
const Application = require("../lib/Application");
const config = require("../config/application/config.json");
const Database = require("../lib/Database");
const Module = require("../lib/Module");
const Tools = require("../lib/Tools");
const moment = require("moment");
const hugDeleteTimeout = 40000;

/** @extends { Module<import("./hug-config.json")> } */
module.exports = class Hug extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				this.hugEmoji = Application.modules.Discord.getEmoji("gc_cannihug");

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
		// Politely asking for a hug from Canni.
		let canni_hug = msg.mentions.has(Application.modules.Discord.client.user)
			|| Tools.msg_contains_list(msg, this.config.phrase_askHug);
		let hug = Tools.strStartsWord(msg.content, "hug");
		let megahug = Tools.strStartsWord(msg.content, "megahug");

		if (canni_hug) {
			this.hug(msg, this.config.requestHugAnswer, msg.author.toString());
		} else if (hug) {
			this.processHugs(msg);
		} else if (megahug) {
			this.processMegaHugs(msg);
		} else {
			// none matched, return early
			return;
		}

		setTimeout(() => msg.delete(), config.deleteDelay);
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	processHugs(msg) {
		if (!msg.mentions.everyone && msg.mentions.users.array().length > 0) {
			const users = msg.mentions.users.array();

			if (users.length > this.config.hugLimit) {
				this.setCooldown(msg);
			} else if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.hugType)) {
				for (let i = 0; i < users.length; i++) {
					// Hug targeted at Canni.
					if (Application.checkSelf(users[i].id)) {
						this.hug(msg, this.config.botHugAnswer);
						continue;
					}

					// Hugs targeted at self.
					if (users[i].id === msg.author.id) {
						this.hug(msg, this.config.selfHugAnswer);
						continue;
					}

					this.hug(msg, this.config.hugAnswer, users[i].toString());
				}
			}
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	processMegaHugs(msg) {
		const now = moment();
		const val = moment().endOf("day");
		const megaHugTimeout = val.diff(now, "milliseconds");

		if (!msg.mentions.everyone && msg.mentions.users.array().length === 1) {
			const user = msg.mentions.users.array()[0];

			if (Application.checkSelf(user.id)) {
				return this.megaHug(msg, this.config.megaSelfHugAnswer, msg.author.toString());
			}

			Database.getTimeout(msg.author.id, "megahug").then((results) => {
				if (results.length == 0) {
					let commit = Database.set_timeout_with_commit(msg.author.id, "megahug");
					return this.megaHug(msg, this.config.megaHugAnswer, user.toString(), commit);
				} else {
					const cooldownMessage = Tools.parseReply(this.config.cooldownMessageMegaHug, msg.author.toString());
					msg.channel.send(cooldownMessage);
				}
			}).catch((err) => {
				this.log.error("Promise rejection error: " + err);
			});

			Application.modules.Discord.setMessageSent();
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { Array<string> } answerType
	 * @param { () => Promise<void> } [commit]
	 */
	megaHug(msg, answerType, target = "", commit) {
		const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
		const answer = Tools.parseReply(answerType[random], target, this.hugEmoji.toString());

		msg.channel.send(answer)
			.then(commit);

		Application.modules.Overload.overload("hug");
		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { Array<string> } answerType
	 */
	hug(msg, answerType, target = "") {
		const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
		const answer = Tools.parseReply(answerType[random], target, msg.author.toString(), this.hugEmoji.toString());

		msg.channel.send(answer).then(message => {
			message.delete({ timeout: hugDeleteTimeout });
		});

		Application.modules.Overload.overload("hug");
		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	setCooldown(msg) {
		const cooldownMessage = Tools.parseReply(
			this.config.cooldownMessage,
			msg.author.toString(),
			Application.modules.Discord.getEmoji("gc_cannierror").toString()
		);

		if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.hugType)) {
			Application.modules.Discord.setCooldown(msg.author.id, this.config.hugType, this.config.hugTimeout);
			Application.modules.Discord.sendCooldownMessage(msg, msg.author.id + this.config.hugType, cooldownMessage, false);
			this.log.info(`${msg.author} added to bap cooldown list.`);
		}

		Application.modules.Discord.setMessageSent();
	}
};
