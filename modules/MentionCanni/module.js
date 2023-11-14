"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");

/** @extends { Module<import("../../config/MentionCanni.json")> } */
module.exports = class MentionCanni extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				if (Application.modules.Discord.checkUserAccess(msg.author) && msg.mentions.has(Application.modules.Discord.client.user)) {
					return this.CanniIsMentioned(msg);
				}
			});

			return resolve(this);
		});
	}

	CanniIsMentioned(msg) {
		if (Tools.msg_contains(msg, "i love you") || Tools.msg_contains(msg, "we love you")) {
			return this.love(msg);
		}

		if (Tools.msg_contains(msg, "brohoof") || Tools.msg_contains(msg, "/)")) {
			return this.broHoof(msg);
		}

		if (Tools.msg_contains_list(msg, this.config.phrase_how_are_you)) {
			return this.howAreYou(msg);
		}

		if (Tools.msg_contains_list(msg, this.config.phrase_how_many_members)) {
			return this.memberCount(msg);
		}

		if (Tools.msg_contains(msg, "merry christmas")) {
			Application.modules.Discord.setMessageSent();
		}
	}

	love(msg) {
		const cooldownMessage = Tools.parseReply(this.config.cooldownMessageLove, [msg.author, Application.modules.Discord.getEmoji("gc_cannierror")]);

		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.loveCanniType, true, "channel", cooldownMessage)) {
			const random = Tools.getRandomIntFromInterval(0, this.config.loveAnswer.length - 1);
			msg.channel.send(Tools.parseReply(this.config.loveAnswer[random], [msg.author, Application.modules.Discord.getEmoji("gc_cannilove")]));

			Application.modules.Discord.setMessageSent();
		}
	}

	howAreYou(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.howAreYouType)) {
			const broken = Tools.getRandomIntFromInterval(0, 200);

			if (broken === 100) {
				msg.channel.send(Tools.parseReply(this.config.chrisBrokeMeAnswer, [msg.author]));
			} else if (broken === 110) {
				msg.channel.send(Tools.parseReply(this.config.xrayBrokeMeAnswer, [msg.author]));
			} else if (broken <= 10) {
				msg.channel.send(Tools.parseReply(this.config.remoteAnswer, [msg.author]));
			} else {
				const random = Tools.getRandomIntFromInterval(0, this.config.howAreYouAnswer.length - 1);
				msg.channel.send(Tools.parseReply(this.config.howAreYouAnswer[random], [msg.author]));
			}

			Application.modules.Discord.setMessageSent();
		}
	}

	memberCount(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.memberCountType)) {
			msg.channel.send(Tools.parseReply(this.config.ans_memberCount, [msg.guild.memberCount]));
		}

		Application.modules.Discord.setMessageSent();
	}

	broHoof(msg) {
		const random = Tools.getRandomIntFromInterval(0, this.config.broHoofAnswer.length - 1);
		msg.channel.send(Tools.parseReply(this.config.broHoofAnswer[random], [msg.author]));

		Application.modules.Discord.setMessageSent();
	}
};
