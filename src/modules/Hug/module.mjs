import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import app_config from "../../config/application/config.json" assert { type: "json" };
import Database from "../../lib/Database.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";
import moment from "moment";

import config from "../../config/Hug.json" assert { type: "json" };

const hugDeleteTimeout = 40000;

export const hug = define_module(async mi => {
	let hug_emoji = (await app.modules).discord.get_emoji("gc_cannihug");

	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	function handle(msg) {
		// Politely asking for a hug from Canni.
		if (msg.mentions.has(Application.modules.Discord.client.user)) {
			if (Tools.msg_contains_list(msg, config.phrase_askHug)) {
				return hug(msg, config.requestHugAnswer, msg.author);
			}
		}

		if (Tools.strStartsWord(msg.content, "hug")) {
			processHugs(msg);
		}

		if (Tools.strStartsWord(msg.content, "megahug")) {
			processMegaHugs(msg);
		}
	}

	function processHugs(msg) {
		if (!msg.mentions.everyone && msg.mentions.users.array().length > 0) {
			const users = msg.mentions.users.array();

			if (users.length > config.hugLimit) {
				setCooldown(msg);
			} else if (!Application.modules.Discord.hasCooldown(msg.author.id, config.hugType)) {
				for (let i = 0; i < users.length; i++) {
					// Hug targeted at Canni.
					if (Application.checkSelf(users[i].id)) {
						hug(msg, config.botHugAnswer);
						continue;
					}

					// Hugs targeted at self.
					if (users[i].id === msg.author.id) {
						hug(msg, config.selfHugAnswer);
						continue;
					}

					hug(msg, config.hugAnswer, users[i]);
				}
			}
		}
	}

	function processMegaHugs(msg) {
		const now = moment();
		const val = moment().endOf("day");
		const megaHugTimeout = val.diff(now, "milliseconds");

		if (!msg.mentions.everyone && msg.mentions.users.array().length === 1) {
			const user = msg.mentions.users.array()[0];

			if (Application.checkSelf(user.id)) {
				return megaHug(msg, config.megaSelfHugAnswer, msg.author);
			}

			Database.getTimeout(msg.author.id, "megahug").then((results) => {
				if (results.length == 0) {
					Database.setTimeout(msg.author.id, "megahug");
					return megaHug(msg, config.megaHugAnswer, user);
				} else {
					const cooldownMessage = Tools.parseReply(config.cooldownMessageMegaHug, [msg.author]);
					msg.channel.send(cooldownMessage);
				}
			}).catch((err) => {
				mi.logger.error("Promise rejection error: " + err);
			});

			Application.modules.Discord.setMessageSent();
		}
	}

	function megaHug(msg, answerType, target = "") {
		const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
		const answer = Tools.parseReply(answerType[random], [target, hug_emoji]);

		msg.channel.send(answer);

		Application.modules.Overload.overload("hug");
		Application.modules.Discord.setMessageSent();
	}

	function hug(msg, answerType, target = "") {
		const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
		const answer = Tools.parseReply(answerType[random], [target, msg.author, hug_emoji]);

		msg.channel.send(answer).then(message => {
			message.delete({ timeout: hugDeleteTimeout });
		});

		setTimeout(() => msg.delete(), hugDeleteTimeout);
		Application.modules.Overload.overload("hug");
		Application.modules.Discord.setMessageSent();
	}

	function setCooldown(msg) {
		const cooldownMessage = Tools.parseReply(config.cooldownMessage, [msg.author, Application.modules.Discord.getEmoji("gc_cannierror")]);

		if (!Application.modules.Discord.hasCooldown(msg.author.id, config.hugType)) {
			Application.modules.Discord.setCooldown(msg.author.id, config.hugType, config.hugTimeout);
			Application.modules.Discord.sendCooldownMessage(msg, msg.author.id + config.hugType, cooldownMessage, false);
			mi.logger.info(`${msg.author} added to hug cooldown list.`);
		}

		Application.modules.Discord.setMessageSent();
	}
});

export default class Hug extends Module {
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

	handle(msg) {
		// Politely asking for a hug from Canni.
		if (msg.mentions.has(Application.modules.Discord.client.user)) {
			if (Tools.msg_contains_list(msg, this.config.phrase_askHug)) {
				return this.hug(msg, this.config.requestHugAnswer, msg.author);
			}
		}

		if (Tools.strStartsWord(msg.content, "hug")) {
			this.processHugs(msg);
		}

		if (Tools.strStartsWord(msg.content, "megahug")) {
			this.processMegaHugs(msg);
		}
	}

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

					this.hug(msg, this.config.hugAnswer, users[i]);
				}
			}
		}
	}

	processMegaHugs(msg) {
		const now = moment();
		const val = moment().endOf("day");
		const megaHugTimeout = val.diff(now, "milliseconds");

		if (!msg.mentions.everyone && msg.mentions.users.array().length === 1) {
			const user = msg.mentions.users.array()[0];

			if (Application.checkSelf(user.id)) {
				return this.megaHug(msg, this.config.megaSelfHugAnswer, msg.author);
			}

			Database.getTimeout(msg.author.id, "megahug").then((results) => {
				if (results.length == 0) {
					Database.setTimeout(msg.author.id, "megahug");
					return this.megaHug(msg, this.config.megaHugAnswer, user);
				} else {
					const cooldownMessage = Tools.parseReply(this.config.cooldownMessageMegaHug, [msg.author]);
					msg.channel.send(cooldownMessage);
				}
			}).catch((err) => {
				this.log.error("Promise rejection error: " + err);
			});

			Application.modules.Discord.setMessageSent();
		}
	}

	megaHug(msg, answerType, target = "") {
		const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
		const answer = Tools.parseReply(answerType[random], [target, this.hugEmoji]);

		msg.channel.send(answer);

		Application.modules.Overload.overload("hug");
		Application.modules.Discord.setMessageSent();
	}

	hug(msg, answerType, target = "") {
		const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
		const answer = Tools.parseReply(answerType[random], [target, msg.author, this.hugEmoji]);

		msg.channel.send(answer).then(message => {
			message.delete({ timeout: hugDeleteTimeout });
		});

		setTimeout(() => msg.delete(), config.deleteDelay);
		Application.modules.Overload.overload("hug");
		Application.modules.Discord.setMessageSent();
	}

	setCooldown(msg) {
		const cooldownMessage = Tools.parseReply(this.config.cooldownMessage, [msg.author, Application.modules.Discord.getEmoji("gc_cannierror")]);

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
