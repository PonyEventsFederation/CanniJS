"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const config = require("../../config/application/config.json");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");
const bapDeleteTimeout = 40000;
// /** @type { string } */
// let wachmann_id;

/** @extends { Module<import("../../config/Bap.json")> } */
module.exports = class Bap extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");
			this.boopCooldown = new Set();
			this.messageSent = new Set();

			// if (Tools.test_ENV("WACHMANN_ID")) {
			// 	wachmann_id = process.env["WACHMANN_ID"];
			// }

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
		if (!msg.mentions.everyone && msg.mentions.users.array().length > 0) {
			if (Tools.strStartsWord(msg.content, "bap")) {
				this.processBaps(msg, this.config.bapType, "bap");
			}

			if (Tools.strStartsWord(msg.content, "bapeth")) {
				this.processBaps(msg, this.config.bapethType, "bapeth");
			}
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { string } type
	 * @param { string } answerType
	 */
	processBaps(msg, type, answerType) {
		console.log(answerType);
		const users = msg.mentions.users.array();

		if (users.length > this.config.bapLimit) {
			this.setCooldown(msg);
		}

		if (!Application.modules.Discord.hasCooldown(msg.author.id, type)) {
			for (let i = 0; i < users.length; i++) {
				if (Application.checkSelf(users[i].id)) {
					const answers = this.getAnswerType("self" + answerType);
					this.selfBap(msg, answers);
					continue;
				}

				// if (wachmann_id === users[i].id) {
				// 	this.wachmannBap(msg, users[i]);
				// 	continue;
				// }

				const answers = this.getAnswerType(answerType);
				this.bap(msg, users[i], answers);
			}

			setTimeout(() => msg.delete(), config.deleteDelay);
		}
	}

	/**
	 * @param {
	 *    | "bap"
	 *    | "bapeth"
	 *    | "selfbap"
	 *    | "selfbapeth"
	 * } type
	 */
	getAnswerType(type) {
		switch(type) {
		case "bap":
			return this.config.bapAnswer;
		case "bapeth":
			return this.config.bapethAnswer;
		case "selfbap":
			return this.config.selfBapAnswer;
		case "selfbapeth":
			return this.config.selfBapethAnswer;
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { import("discord.js").User } user
	 * @param { Array<string> } answerType
	 */
	bap(msg, user, answerType) {
		const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);

		msg.channel.send(Tools.parseReply(answerType[random], user.toString())).then(message => {
			message.delete({ timeout: bapDeleteTimeout });
		});

		Application.modules.Overload.overload("bap");
		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { Array<string> } answerType
	 */
	selfBap(msg, answerType) {
		let response;

		if (Tools.chancePercent(25)) {
			const random = Tools.getRandomIntFromInterval(0, this.config.selfBapAnswer.length - 1);
			response = msg.channel.send(Tools.parseReply(this.config.selfBapAnswer[random],
				msg.author.toString(),
				Application.modules.Discord.getEmoji("gc_cannierror").toString()
			));
		} else {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			response = msg.channel.send(Tools.parseReply(answerType[random],
				msg.author.toString(),
				Application.modules.Discord.getEmoji("gc_cannierror").toString()
			));
		}

		response.then(message => {
			message.delete({ timeout: bapDeleteTimeout });
		});

		Application.modules.Overload.overload("bap");
		Application.modules.Discord.setMessageSent();
	}

	// /**
	//  * @param { import("discord.js").Message } msg
	//  * @param { import("discord.js").User } user
	//  */
	// wachmannBap(msg, user) {
	// 	const guardCooldownMessage = Tools.parseReply(this.config.bapGuardCooldownAnswer);
	//
	// 	if (Application.modules.Discord.controlTalkedRecently(msg, this.config.bapGuardType, true, "channel", guardCooldownMessage, undefined, 120000)) {
	// 		this.bap(msg, user);
	// 	}
	// }

	/**
	 * @param { import("discord.js").Message } msg
	 */
	setCooldown(msg) {
		const cooldownMessage = Tools.parseReply(this.config.cooldownMessage, msg.author.toString());

		if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.bapType)) {
			Application.modules.Discord.setCooldown(msg.author.id, this.config.bapType, this.config.bapTimeout);
			Application.modules.Discord.sendCooldownMessage(msg, msg.author.id + this.config.bapType, cooldownMessage, false);
			this.log.info(`${msg.author} added to bap cooldown list.`);
		}

		Application.modules.Discord.setMessageSent();
	}
};
