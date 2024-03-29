"use strict";

// @IMPORTS
const Application = require("../lib/Application");
const config = require("../config/application/config.json");
const Database = require("../lib/Database");
const Module = require("../lib/Module");
const Tools = require("../lib/Tools");
const moment = require("moment");
const path = Application.config.rootDir + "/data/impact.gif";
let boop_dev_on = true;
// /** @type { string } */
// let wachmann_id;

/** @extends { Module<import("./boop-config.json")> } */
module.exports = class Boop extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			this.boopCooldown = new Set();
			this.messageSent = new Set();
			this.interrupt = { inter: false };
			this.megaon = false;

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
		if (Tools.strStartsWord(msg.content, "boop") && !msg.mentions.everyone && msg.mentions.users.array().length > 0) {
			const users = msg.mentions.members?.array() || [];

			if (users.length > this.config.boopLimit) {
				this.setCooldown(msg, users);
			}

			if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.boopType)) {
				this.processBoops(msg, users);
				// todo
			}
		}

		if (this.megaon) {
			this.processBlocks(msg);
			// todo?
		} else if (boop_dev_on) {
			// todo
			this.processMegaboops(msg);
			this.processUltraBoops(msg);
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { Array<import("discord.js").GuildMember> } users
	 */
	processBoops(msg, users) {
		for (let i = 0; i < users.length; i++) {
			if (Application.checkSelf(users[i].id)) {
				this.selfBoop(msg);
				continue;
			}

			// if (wachmann_id === users[i].id) {
			// 	this.wachmannBoop(msg, users[i]);
			// 	continue;
			// }

			this.boop(msg, users[i]);
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	processBlocks(msg) {
		if (Application.modules.DevCommands.auth_dev(msg.author.id)) {
			if (Tools.strStartsWord(msg.content, "devblock")) {
				return this.counter(msg, "DevBlock");
			} else if (Tools.strStartsWord(msg.content, "devcounter")) {
				return this.counter(msg, "DevCounter");
			}
		}

		if (Tools.strStartsWord(msg.content, "block")) {
			const now = moment();
			const val = moment().endOf("day");
			const blockTimeout = val.diff(now, "milliseconds");
			if (Application.modules.Discord.controlTalkedRecently(msg, this.config.megaBoopType, false, "message", undefined, undefined, blockTimeout)) {
				return this.counter(msg, "Block");
			}
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	processMegaboops(msg) {
		if (Tools.strStartsWord(msg.content, "megaboop")) {
			if (!msg.mentions.everyone && msg.mentions.users.array().length === 1) {
				const user = msg.mentions.users.array()[0];
				if (Application.checkSelf(user.id)) {
					return this.megaSelfBoop(msg);
				}

				Database.getTimeout(msg.author.id, "megaboop").then((results) => {
					if (results.length == 0) {
						let commit = Database.set_timeout_with_commit(msg.author.id, "megaboop");
						return this.megaBoopLoader(msg, user, commit);
					} else {
						const cooldownMessage = Tools.parseReply(this.config.cooldownMessageMegaBoop, msg.author.toString());
						msg.channel.send(cooldownMessage);
					}
				}).catch((err) => {
					this.log.error("Promise rejection error: " + err);
				});

				Application.modules.Discord.setMessageSent();
			}
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	processUltraBoops(msg) {
		if (Tools.msg_starts(msg, "master chief dev ultra boop") ||
        Tools.msg_starts(msg, "master chief dev ultraboop") ||
        Tools.msg_starts(msg, "ultraboop")) {
			if (Application.modules.DevCommands.auth_dev_master(msg.author.id) && !msg.mentions.everyone && msg.mentions.users.array().length === 1) {
				const user = msg.mentions.users.array()[0];

				if (Application.checkSelf(user.id)) {
					return this.selfDevBoop(msg);
				}

				return this.devboop(msg, user);
			} else {
				return this.devbooprejection(msg);
			}
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { import("discord.js").GuildMember } user
	 */
	boop(msg, user) {
		setTimeout(() => msg.delete(), config.deleteDelay);

		const random = Tools.getRandomIntFromInterval(0, this.config.boopAnswer.length - 1);
		msg.channel.send(Tools.parseReply(this.config.boopAnswer[random], user.toString())).then(message => {
			message.delete({ timeout: this.config.boop_delete_timeout });
		});

		Application.modules.Overload.overload("boop");
		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	selfBoop(msg) {
		if (Tools.chancePercent(5)) {
			const random = Tools.getRandomIntFromInterval(0, this.config.selfBoopAnswer.length - 1);
			const answer = Tools.parseReply(
				this.config.selfBoopAnswer[random],
				Application.modules.Discord.getEmoji("gc_canniexcited").toString()
			);
			msg.channel.send(answer).then(message => {
				message.delete({ timeout: this.config.boop_delete_timeout });
			});
		} else {
			const random = Tools.getRandomIntFromInterval(0, this.config.canniBoopAnswer.length - 1);
			const answer = Tools.parseReply(
				this.config.canniBoopAnswer[random],
				msg.author.toString(),
				Application.modules.Discord.getEmoji("gc_cannishy").toString()
			);
			msg.channel.send(answer).then(message => {
				message.delete({ timeout: this.config.boop_delete_timeout });
			});
		}

		setTimeout(() => msg.delete(), config.deleteDelay);

		Application.modules.Overload.overload("boop");
		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { import("discord.js").GuildMember } user
	 */
	wachmannBoop(msg, user) {
		const guard_cooldown_message = Tools.parseReply(this.config.ans_boop_guard_cooldown);
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.boop_guard_type, true, "channel", guard_cooldown_message, undefined, 120000)) {
			this.boop(msg, user);
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { import("discord.js").User } user
	 * @param { () => Promise<void> } commit
	 */
	megaBoopLoader(msg, user, commit) {
		const roll = Tools.getRandomIntFromInterval(0, 100);

		if (roll === 100) {
			this.hyperBoop(msg, user, commit);
		} else if (roll >= 0 && roll <= 5) {
			this.megaBoop(msg, user, "miss", commit);
		} else if (roll >= 90 && roll <= 99) {
			this.megaBoop(msg, user, "crit", commit);
		} else {
			this.megaBoop(msg, user, "hit", commit);
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { import("discord.js").User } user
	 * @param { "hit" | "miss" | "crit" } type
	 * @param { () => Promise<void> } commit
	 */
	megaBoop(msg, user, type, commit) {
		let random;
		/** @type { number } */
		let damage;
		/** @type { string | Array<string> } */
		let answer = "";
		let limit;
		this.interrupt.inter = false;
		switch (type) {
		case "miss":
			random = Tools.getRandomIntFromInterval(0, this.config.megaBoopMissAnswer.length - 1);
			answer = this.config.megaBoopMissAnswer[random];
			limit = 20;
			break;
		case "crit":
			random = Tools.getRandomIntFromInterval(0, this.config.megaBoopCritAnswer.length - 1);
			damage = Tools.getRandomIntFromInterval(13500, 18000);
			answer = this.config.megaBoopCritAnswer[random];
			limit = 90;
			break;
		case "hit":
			random = Tools.getRandomIntFromInterval(0, this.config.megaBoopAnswer.length - 1);
			damage = Tools.getRandomIntFromInterval(9000, 12000);
			answer = this.config.megaBoopAnswer[random];
			limit = 60;
			break;
		}

		answer = this.statusgenerator(answer, limit, type === "miss");

		let init_delay = 1000;
		let delay = 3000;

		if (Application.modules.DevCommands.auth_dev(msg.author.id)) {
			init_delay += 1000;
			delay += 2000;
		}

		this.counterWindow(delay + init_delay);
		setTimeout(() => {
			if (Array.isArray(answer)) {
				Tools
					.listSender(
						msg.channel,
						answer,
						[delay, 2000, 1000],
						[user.toString(), damage.toString()],
						this.interrupt
					)
					.then(commit)
			} else {
				msg.channel
					.send(Tools.parseReply(
						answer,
						user.toString(),
						damage.toString()
					))
					.then(commit);
			}
		}, init_delay);

		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	megaSelfBoop(msg) {
		const random = Tools.getRandomIntFromInterval(0, this.config.megaSelfBoopAnswer.length - 1);
		msg.channel.send(Tools.parseReply(
			this.config.megaSelfBoopAnswer[random],
			msg.author.toString(),
			Application.modules.Discord.getEmoji("gc_cannihello").toString()
		));

		Application.modules.Overload.overload("boop");
		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { import("discord.js").User } user
	 * @param { () => Promise<void> } commit
	 */
	hyperBoop(msg, user, commit) {
		const random = Tools.getRandomIntFromInterval(0, this.config.hyperBoopAnswer.length - 1);
		const ans = this.config.hyperBoopAnswer[random];
		if (Array.isArray(ans)) {
			Tools.listSender(
				msg.channel,
				ans,
				[1000, 2000, 4000, 4000, 2000, 2000, 2000, 2000, 3000],
				[user.toString()]
			);
		} else {
			msg.channel.send(Tools.parseReply(ans, user.toString()))
				.then(commit);
		}

		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	devbooprejection(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.dev_ultra_boop_rejection_type, false, "message")) {
			const random = Tools.getRandomIntFromInterval(0, this.config.dev_ultra_boop_rejection.length - 1);
			msg.channel.send(Tools.parseReply(this.config.dev_ultra_boop_rejection[random], msg.author.toString()));
		}

		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	selfDevBoop(msg) {
		const random = Tools.getRandomIntFromInterval(0, this.config.dev_self_boop.length - 1);
		msg.channel.send(Tools.parseReply(this.config.dev_self_boop[random], msg.author.toString()));

		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { import("discord.js").User } user
	 */
	devboop(msg, user) {
		boop_dev_on = false;
		const random = Tools.getRandomIntFromInterval(0, this.config.dev_ultra_boop.length - 1);
		const ans = this.config.dev_ultra_boop[random];
		const delay = [2000, 3000, 3000, 3000, 3000, 15000, 15000, 15000, 13000, 2000, 3000, 3000, 3000, 5000];
		const delay2 = 2000;
		const config = this.config;
		if (Array.isArray(ans)) {
			Tools.listSender(msg.channel, ans, delay, [user.toString()]).then(() => {
				setTimeout(function() {
					msg.channel.send(Tools.parseReply(config.dev_ultra_boop_impact, user.toString()), { files: [path] }).then(function() {
						boop_dev_on = true;
						msg.channel.send(Tools.parseReply(config.dev_ultra_boop_postimpact));
					});
				}, delay2);
			});

		} else {
			msg.channel.send(Tools.parseReply(ans, user.toString()));
		}

		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { string } type_pre
	 */
	counter(msg, type_pre) {
		this.interrupt.inter = true;
		/** @type { Array<string> } */
		let ans;
		/** @type { string | number } */
		let type;
		if (type_pre === "Block") {
			ans = this.config.megaBoopBlock;
			ans = this.statusgenerator(ans, 35);
			type = Tools.getRandomIntFromInterval(2000, 5000);
		} else {
			ans = this.config.megaBoopDevBlock;
			type = type_pre;
		}
		setTimeout(function() {
			Tools.listSender(msg.channel, ans, [2000], [msg.author.toString(), type.toString()]);
		}.bind(this), 2000);
		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { number } time
	 */
	counterWindow(time) {
		this.megaon = true;
		setTimeout(function() {
			this.megaon = false;
		}.bind(this), time);
	}

	/**
	 * @param { Array<string> } ans
	 * @param { number } limit
	 */
	statusgenerator(ans, limit, miss = false) {
		let res = [];

		if (Tools.chancePercent(limit)) {
			const template = miss ? this.config.status_effect_miss_template : this.config.status_effect_template;
			const random = Tools.getRandomIntFromInterval(0, this.config.status_effects.length - 1);
			const effect = this.config.status_effects[random];
			const add = Tools.parseReply(template, effect);

			let i;
			let len;
			for(i = 0, len = ans.length; i < len; ++i) {
				res[i] = ans[i];
			}
			res[i] = add;
		} else {
			res = ans;
		}

		return res;
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { Array<import("discord.js").GuildMember> } users
	 */
	setCooldown(msg, users) {
		const cooldownMessage = Tools.parseReply(
			this.config.cooldownMessage,
			msg.author.toString(),
			Application.modules.Discord.getEmoji("gc_cannierror").toString()
		);

		if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.boopType)) {
			Application.modules.Discord.setCooldown(msg.author.id, this.config.boopType, this.config.boopTimeout);
			Application.modules.Discord.sendCooldownMessage(msg, msg.author.id + this.config.boopType, cooldownMessage, false);
			this.log.info(`${msg.author} added to boop cooldown list.`);

			const no_command_users = users.filter(u => !Tools.allows_command_use(u));
			const word = no_command_users.length === 1 ? no_command_users[0].toString()
				: no_command_users.length === 2 ? no_command_users.map(u => u.toString()).join(" and ")
					: no_command_users.length > 2 ? no_command_users.map(u => u.toString()).slice(0, -1).join(", ") + ", and " + no_command_users.slice(-1).toString()
						: false;
			if (!word) return;

			msg.channel.send(
				Tools.parseReply(this.config.command_use_not_allowed_cooldown_response, word),
				{ allowedMentions: { users: [] } }
			);
		}

		Application.modules.Discord.setMessageSent();
	}
};
