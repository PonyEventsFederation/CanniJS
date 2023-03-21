import { define_module, stop } from "../lib/Module.mjs";
import * as app from "../lib/Application.mjs";
import Tools from "../lib/Tools.mjs";

const config = {
	"loveAnswer": [
		"%s I love you too! %s"
	],
	"howAreYouAnswer": [
		"%s I'm okay, thank you for asking!",
		"%s I am absolutely great!",
		"%s I'm a bit sad that it's not GalaCon yet.",
		"%s I'm still a little sleepy.",
		"%s I'm running a bit low on Fanta."
	],
	"broHoofAnswer": [
		"%s /)*(\\"
	],
	"chrisBrokeMeAnswer": "%s I'm not sure. I think Berry might've broken something again...",
	"xrayBrokeMeAnswer": "%s I'm not sure. I think Xray messed up something with the Python environment again...",
	"remoteAnswer": "%s Sometimes I feel like I'm being remote controlled...",
	"loveCanniType": "loveCanni",
	"howAreYouType": "howAreYou",
	"memberCountType": "memberCount",
	"cooldownMessageLove": "I cannot handle this much love! %s",
	"phrase_how_are_you": [
		"how are you",
		"how're you",
		"how’re you",
		"I am fine and u",
		"I am fine and you",
		"and you?",
		"and u?"
	],
	"phrase_how_many_members": [
		"how many members are there",
		"how many members are on the server"
	],
	"ans_memberCount": "There are currently %s server members."
};

export const mention_canni = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	discord.client.on("message", async msg => {
		if (discord.check_user_access(msg.author) && msg.mentions.has(discord.client.user)) {
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
			discord.set_message_sent();
		}
	}

	function love(msg) {
		const cooldownMessage = Tools.parseReply(config.cooldownMessageLove, [msg.author, discord.get_emoji("gc_cannierror")]);

		if (discord.control_talked_recently(msg, config.loveCanniType, true, "channel", cooldownMessage)) {
			const random = Tools.getRandomIntFromInterval(0, config.loveAnswer.length - 1);
			msg.channel.send(Tools.parseReply(config.loveAnswer[random], [msg.author, discord.get_emoji("gc_cannilove")]));

			discord.set_message_sent();
		}
	}

	function howAreYou(msg) {
		if (discord.control_talked_recently(msg, config.howAreYouType)) {
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

			discord.set_message_sent();
		}
	}

	function memberCount(msg) {
		if (discord.control_talked_recently(msg, config.memberCountType)) {
			msg.channel.send(Tools.parseReply(config.ans_memberCount, [msg.guild.memberCount]));
		}

		discord.set_message_sent();
	}

	function broHoof(msg) {
		const random = Tools.getRandomIntFromInterval(0, config.broHoofAnswer.length - 1);
		msg.channel.send(Tools.parseReply(config.broHoofAnswer[random], [msg.author]));

		discord.set_message_sent();
	}
});
