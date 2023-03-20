import { define_module } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";

import app_config from "../../config/application/config.json" assert { type: "json" };
import config from "../../config/Bap.json" assert{ type: "json" };

import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";
const bapDeleteTimeout = 40000;
/** @type { string } */
let wachmann_id;

export const bap = define_module(async mi => {
	const boopCooldown = new Set();
	const messageSent = new Set();
	/** @type { string } */
	// @ts-expect-error
	let wachmann_id = undefined;

	if (process.env["WACHMANN_ID"]) {
		wachmann_id = process.env["WACHMANN_ID"];
	}

	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	function handle(msg) {
		if (!msg.mentions.everyone && msg.mentions.users.array().length > 0) {
			if (Tools.strStartsWord(msg.content, "bap")) {
				processBaps(msg, config.bapType, "bap");
			}

			if (Tools.strStartsWord(msg.content, "bapeth")) {
				processBaps(msg, config.bapethType, "bapeth");
			}
		}
	}

	function processBaps(msg, type, answerType) {
		console.log(answerType);
		const users = msg.mentions.users.array();

		if (users.length > config.bapLimit) {
			setCooldown(msg);
		}

		if (!Application.modules.Discord.hasCooldown(msg.author.id, type)) {
			for (let i = 0; i < users.length; i++) {
				if (Application.checkSelf(users[i].id)) {
					const answers = getAnswerType("self" + answerType);
					selfBap(msg, answers);
					continue;
				}

				if (wachmann_id === users[i].id) {
					wachmannBap(msg, users[i]);
					continue;
				}

				const answers = getAnswerType(answerType);
				bap(msg, users[i], answers);
			}

			setTimeout(() => msg.delete(), app_config.deleteDelay);
		}
	}

	function getAnswerType(type) {
		switch(type) {
		case "bap":
			return config.bapAnswer;
		case "bapeth":
			return config.bapethAnswer;
		case "selfbap":
			return config.selfBapAnswer;
		case "selfbapeth":
			return config.selfBapethAnswer;
		}
	}

	function bap(msg, user, answerType) {
		const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);

		msg.channel.send(Tools.parseReply(answerType[random], [user])).then(message => {
			message.delete({ timeout: bapDeleteTimeout });
		});

		Application.modules.Overload.overload("bap");
		Application.modules.Discord.setMessageSent();
	}

	function selfBap(msg, answerType) {
		let response;

		if (Tools.chancePercent(25)) {
			const random = Tools.getRandomIntFromInterval(0, config.selfBapAnswer.length - 1);
			response = msg.channel.send(Tools.parseReply(config.selfBapAnswer[random], [
				msg.author,
				Application.modules.Discord.getEmoji("gc_cannierror")
			]));
		} else {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			response = msg.channel.send(Tools.parseReply(answerType[random], [
				msg.author,
				Application.modules.Discord.getEmoji("gc_cannierror")
			]));
		}

		response.then(message => {
			message.delete({ timeout: bapDeleteTimeout });
		});

		Application.modules.Overload.overload("bap");
		Application.modules.Discord.setMessageSent();
	}

	function wachmannBap(msg, user) {
		const guardCooldownMessage = Tools.parseReply(config.bapGuardCooldownAnswer);

		if (Application.modules.Discord.controlTalkedRecently(msg, config.bapGuardType, true, "channel", guardCooldownMessage, undefined, 120000)) {
			bap(msg, user);
		}
	}

	function setCooldown(msg) {
		const cooldownMessage = Tools.parseReply(config.cooldownMessage, [msg.author]);

		if (!Application.modules.Discord.hasCooldown(msg.author.id, config.bapType)) {
			Application.modules.Discord.setCooldown(msg.author.id, config.bapType, config.bapTimeout);
			Application.modules.Discord.sendCooldownMessage(msg, msg.author.id + config.bapType, cooldownMessage, false);
			mi.logger.info(`${msg.author} added to bap cooldown list.`);
		}

		Application.modules.Discord.setMessageSent();
	}
});

export default class Boop extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");
			this.boopCooldown = new Set();
			this.messageSent = new Set();

			if (Tools.test_ENV("WACHMANN_ID")) {
				wachmann_id = process.env["WACHMANN_ID"];
			}

			Application.modules.Discord.client.on("message", (msg) => {
				if (Application.modules.Discord.checkUserAccess(msg.author)) {
					this.handle(msg);
				}
			});

			return resolve(this);
		});
	}

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

				if (wachmann_id === users[i].id) {
					this.wachmannBap(msg, users[i]);
					continue;
				}

				const answers = this.getAnswerType(answerType);
				this.bap(msg, users[i], answers);
			}

			setTimeout(() => msg.delete(), app_config.deleteDelay);
		}
	}

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

	bap(msg, user, answerType) {
		const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);

		msg.channel.send(Tools.parseReply(answerType[random], [user])).then(message => {
			message.delete({ timeout: bapDeleteTimeout });
		});

		Application.modules.Overload.overload("bap");
		Application.modules.Discord.setMessageSent();
	}

	selfBap(msg, answerType) {
		let response;

		if (Tools.chancePercent(25)) {
			const random = Tools.getRandomIntFromInterval(0, this.config.selfBapAnswer.length - 1);
			response = msg.channel.send(Tools.parseReply(this.config.selfBapAnswer[random], [
				msg.author,
				Application.modules.Discord.getEmoji("gc_cannierror")
			]));
		} else {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			response = msg.channel.send(Tools.parseReply(answerType[random], [
				msg.author,
				Application.modules.Discord.getEmoji("gc_cannierror")
			]));
		}

		response.then(message => {
			message.delete({ timeout: bapDeleteTimeout });
		});

		Application.modules.Overload.overload("bap");
		Application.modules.Discord.setMessageSent();
	}

	wachmannBap(msg, user) {
		const guardCooldownMessage = Tools.parseReply(this.config.bapGuardCooldownAnswer);

		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.bapGuardType, true, "channel", guardCooldownMessage, undefined, 120000)) {
			this.bap(msg, user);
		}
	}

	setCooldown(msg) {
		const cooldownMessage = Tools.parseReply(this.config.cooldownMessage, [msg.author]);

		if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.bapType)) {
			Application.modules.Discord.setCooldown(msg.author.id, this.config.bapType, this.config.bapTimeout);
			Application.modules.Discord.sendCooldownMessage(msg, msg.author.id + this.config.bapType, cooldownMessage, false);
			this.log.info(`${msg.author} added to bap cooldown list.`);
		}

		Application.modules.Discord.setMessageSent();
	}

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
}
