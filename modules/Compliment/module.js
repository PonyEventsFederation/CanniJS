"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");
const fetch = require("node-fetch");
let config;

module.exports = class Compliment extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");
			config = this.config;

			Application.modules.Discord.client.on("message", (msg) => {
				this.hugEmoji = Application.modules.Discord.getEmoji("gc_cannihug");

				if (Application.modules.Discord.checkUserAccess(msg.author) && msg.mentions.has(Application.getClient().user)) {
					this.handle(msg);
				}
			});

			return resolve(this);
		});
	}

	handle(msg) {
		if (Tools.msg_starts_mentioned(msg, "compliment")) {
			if (!msg.mentions.everyone && msg.mentions.users.array().length > 0) {
				const users = msg.mentions.users.array();

				for (let i = 0; i < users.length; i++) {
					if (Application.checkSelf(users[i].id)) {
						try {
							const id = Tools.get_id_from_mention(msg.content.split(" ").filter(Boolean)[2]);
							if (msg.mentions.users.array().length === 1 && Application.checkSelf(id)) {
								this.compliment_bot(msg);
							}
						} catch (error) {
							// this.log.error(error);
						}

						continue;
					}

					if (users[i].id === msg.author.id) {
						if (Application.modules.DevCommands.auth_dev(msg.author.id)) {
							this.compliment_dev(msg);
						} else {
							this.compliment(msg, this.config.selfcomplimentType, config.ans_self_compliment_template, msg.author);
						}
						continue;
					}

					this.compliment(msg, this.config.usercomplimentType, config.ans_user_compliment_template, users[i]);
				}
			}
		}
		if (Tools.msg_starts_mentioned(msg, "compliment me")) {
			if (Application.modules.DevCommands.auth_dev(msg.author.id)) {
				return this.compliment_dev(msg);
			} else {
				return this.compliment(msg, this.config.selfcomplimentType, config.ans_self_compliment_template, msg.author);
			}
		}
	}

	compliment(msg, type, answerType, target) {
		if (Application.modules.Discord.controlTalkedRecently(msg, type, true, "message", undefined, undefined, 120000)) {
			this.getCompliment().then(function(out) {
				msg.channel.send(
					Tools.parseReply(answerType,
						[target, Tools.capitalizeFirstLetter(out["compliment"])]
					));
			});
			Application.modules.Discord.setMessageSent();
		}
	}

	compliment_bot(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.botcomplimentType, true, "message", undefined, undefined, 120000)) {
			msg.channel.send(Tools.parseReply(this.config.ans_bot_compliment, [msg.author, this.hugEmoji]));
			Application.modules.Discord.setMessageSent();
		}
	}


	compliment_dev(msg) {
		msg.channel.send(Tools.parseReply(this.config.ans_compliment_dev, [msg.author])).then(function() {
			setTimeout(() => {
				const random = Tools.getRandomIntFromInterval(0, config.ans_compliment_dev_final.length - 1);
				msg.channel.send(Tools.parseReply(config.ans_compliment_dev_final[random], [msg.author]));
			}, config.complimentDevTimeout);
		});
		Application.modules.Discord.setMessageSent();
	}

	getCompliment() {
		return fetch("https://complimentr.com/api").then(res => res.json()).catch(err => console.error(err));
	}
};
