import { define_module, stop } from "../lib/Module.mjs";
import * as app from "../lib/Application.mjs";
import app_config from "../config/application/config.json" assert { type: "json" };
import Database from "../lib/Database.mjs";
import Tools from "../lib/Tools.mjs";
import moment from "moment";

const config = {
	"requestHugAnswer": [
		"%s Of course you can have a hug! \n*HUGS* %s %s"
	],
	"botHugAnswer": [
		"Awwww. That's very sweet of you. \nThank you %s. %s"
	],
	"selfHugAnswer": [
		"*HUGS* %s %s"
	],
	"hugAnswer": [
		"Hey %s! %s hugged you %s"
	],
	"phrase_askHug": [
		"can I get a hug",
		"can i have a hug",
		"please hug me"
	],
	"cooldownMessage": "%s Oh my. I can't keep up with that many hugs. You'll have to let me cool down for a bit! %s",
	"hugLimit": 3,
	"hugTimeout": 180000,
	"hugType": "hugType",
	"megaHugType": "megaHugType",
	"cooldownMessageMegaHug": "%s Oh no! I can't let you Megahug another pony today. That would be far too dangerous! Too much hugging energy!",
	"megaSelfHugAnswer": [
		"Oh my. You must really like me if you're using your megahug on me! \nThank you %s! %s"
	],
	"megaHugAnswer": [
		"%s You have been Megahugged! It looks like somepony really wanted to hug you! %s"
	]
};

const hugDeleteTimeout = 40000;

export const hug = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;
	const overload = await modules.overload;

	let hug_emoji = discord.get_emoji("gc_cannihug");

	discord.client.on("message", async msg => {
		if (discord.check_user_access(msg.author)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	function handle(msg) {
		// Politely asking for a hug from Canni.
		if (msg.mentions.has(discord.client.user)) {
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
			} else if (!discord.has_cooldown(msg.author.id, config.hugType)) {
				for (let i = 0; i < users.length; i++) {
					// Hug targeted at Canni.
					if (discord.check_self(users[i].id)) {
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

			if (discord.check_self(user.id)) {
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

			discord.set_message_sent();
		}
	}

	function megaHug(msg, answerType, target = "") {
		const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
		const answer = Tools.parseReply(answerType[random], [target, hug_emoji]);

		msg.channel.send(answer);

		overload.overload("hug");
		discord.set_message_sent();
	}

	function hug(msg, answerType, target = "") {
		const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
		const answer = Tools.parseReply(answerType[random], [target, msg.author, hug_emoji]);

		msg.channel.send(answer).then(message => {
			message.delete({ timeout: hugDeleteTimeout });
		});

		setTimeout(() => msg.delete(), hugDeleteTimeout);
		overload.overload("hug");
		discord.set_message_sent();
	}

	function setCooldown(msg) {
		const cooldownMessage = Tools.parseReply(config.cooldownMessage, [msg.author, discord.get_emoji("gc_cannierror")]);

		if (!discord.has_cooldown(msg.author.id, config.hugType)) {
			discord.set_cooldown(msg.author.id, config.hugType, config.hugTimeout);
			discord.send_cooldown_message(msg, msg.author.id + config.hugType, cooldownMessage, false);
			mi.logger.info(`${msg.author} added to hug cooldown list.`);
		}

		discord.set_message_sent();
	}
});
