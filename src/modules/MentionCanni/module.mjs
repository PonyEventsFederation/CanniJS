import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/MentionCanni.json" assert { type: "json" };

export const mention_canni = define_module(async mi => {
	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author) && msg.mentions.has((await app.modules).discord.client.user)) {
			CanniIsMentioned(msg);
		}
	});

	return {
		stop
	};

	async function CanniIsMentioned(msg) {
		if (Tools.msg_contains(msg, "i love you") || Tools.msg_contains(msg, "we love you")) {
			return love(msg);
		}

		if (Tools.msg_contains(msg, "brohoof") || Tools.msg_contains(msg, "/)")) {
			return broHoof(msg);
		}

		if (Tools.msg_contains_list(msg, config.phrase_how_are_you)) {
			return howAreYou(msg);
		}

		if (Tools.msg_contains_list(msg, config.phrase_how_many_members)) {
			return memberCount(msg);
		}

		if (Tools.msg_contains(msg, "merry christmas")) {
			(await app.modules).discord.set_message_sent();
		}
	}

	function love(msg) {
		const cooldownMessage = Tools.parseReply(config.cooldownMessageLove, [msg.author, Application.modules.Discord.getEmoji("gc_cannierror")]);

		if (Application.modules.Discord.controlTalkedRecently(msg, config.loveCanniType, true, "channel", cooldownMessage)) {
			const random = Tools.getRandomIntFromInterval(0, config.loveAnswer.length - 1);
			msg.channel.send(Tools.parseReply(config.loveAnswer[random], [msg.author, Application.modules.Discord.getEmoji("gc_cannilove")]));

			Application.modules.Discord.setMessageSent();
		}
	}

	function howAreYou(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, config.howAreYouType)) {
			const broken = Tools.getRandomIntFromInterval(0, 200);

			if (broken === 100) {
				msg.channel.send(Tools.parseReply(config.chrisBrokeMeAnswer, [msg.author]));
			} else if (broken === 110) {
				msg.channel.send(Tools.parseReply(config.xrayBrokeMeAnswer, [msg.author]));
			} else if (broken <= 10) {
				msg.channel.send(Tools.parseReply(config.remoteAnswer, [msg.author]));
			} else {
				const random = Tools.getRandomIntFromInterval(0, config.howAreYouAnswer.length - 1);
				msg.channel.send(Tools.parseReply(config.howAreYouAnswer[random], [msg.author]));
			}

			Application.modules.Discord.setMessageSent();
		}
	}

	function memberCount(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, config.memberCountType)) {
			msg.channel.send(Tools.parseReply(config.ans_memberCount, [msg.guild.memberCount]));
		}

		Application.modules.Discord.setMessageSent();
	}

	function broHoof(msg) {
		const random = Tools.getRandomIntFromInterval(0, config.broHoofAnswer.length - 1);
		msg.channel.send(Tools.parseReply(config.broHoofAnswer[random], [msg.author]));

		Application.modules.Discord.setMessageSent();
	}
});

export default class MentionCanni extends Module {
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

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
}
