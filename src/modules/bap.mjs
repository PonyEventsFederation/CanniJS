import { define_module, stop } from "../lib/Module.mjs";
import * as app from "../lib/Application.mjs";

import app_config from "../config/application/config.json" assert { type: "json" };

const config = {
	"bapAnswer": [
		":newspaper2: *BAPS* %s",
		"*Canni sneaks up behind her target and...*\n:newspaper2: *BAPS* %s",
		"*Canni swings her newspaper at %s.*\n:newspaper2: *BAP*"
	],
	"bapethAnswer": [
		":newspaper2: *BAPETH* %s",
		"Have at thee, cur!\n:newspaper2: *BAPETH* %s",
		"I shall vanquish thee, with mine own newspaper!\n:newspaper2: *BAPETH* %s"
	],
	"canniBapAnswer": [
		":newspaper2:*Canni gives herself a good bap on the head.* \n%s Ouch! That hurt! %s"
	],
	"selfBapAnswer": [
		"%s Noooooo! \nDon't bap me. I'm a good pony. %s",
		":newspaper2: *Canni baps %s instead*.\nTeehee! I got you!"
	],
	"selfBapethAnswer": [
		"%s Nay! Doth not bapeth me.\n I am a valorous pony. %s",
		":newspaper2: *Canni baps %s instead.*\nTake that, Ruffian!"
	],
	"cooldownMessage": "%s It's not very nice to bap people that often, you know...",
	"bapLimit": 3,
	"bapTimeout": 180000,
	"bapType": "bapType",
	"bapethType": "bapethType",
	"bapGuardType": "bapGuardType",
	"bapGuardCooldownAnswer": "I better not, or Wachmann will be mad at me again..."
};


import Tools from "../lib/Tools.mjs";
const bapDeleteTimeout = 40000;

export const bap = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;
	const overload = await modules.overload;

	const boopCooldown = new Set();
	const messageSent = new Set();
	/** @type { string | undefined } */
	let wachmann_id = undefined;

	if (process.env["WACHMANN_ID"]) {
		wachmann_id = process.env["WACHMANN_ID"];
	}

	discord.client.on("message", async msg => {
		if (discord.check_user_access(msg.author)) {
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

	/**
	 * @param { "bap" | "bapeth" } answerType
	 */
	function processBaps(msg, type, answerType) {
		console.log(answerType);
		const users = msg.mentions.users.array();

		if (users.length > config.bapLimit) {
			setCooldown(msg);
		}

		if (!discord.has_cooldown(msg.author.id, type)) {
			for (let i = 0; i < users.length; i++) {
				if (discord.check_self(users[i].id)) {
					const answers = getAnswerType(`self${answerType}`);
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

	/**
	 * @param { "bap" | "bapeth" | "selfbap" | "selfbapeth" } type
	 */
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

		overload.overload("bap");
		discord.set_message_sent();
	}

	function selfBap(msg, answerType) {
		let response;

		if (Tools.chancePercent(25)) {
			const random = Tools.getRandomIntFromInterval(0, config.selfBapAnswer.length - 1);
			response = msg.channel.send(Tools.parseReply(config.selfBapAnswer[random], [
				msg.author,
				discord.get_emoji("gc_cannierror")
			]));
		} else {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			response = msg.channel.send(Tools.parseReply(answerType[random], [
				msg.author,
				discord.get_emoji("gc_cannierror")
			]));
		}

		response.then(message => {
			message.delete({ timeout: bapDeleteTimeout });
		});

		overload.overload("bap");
		discord.set_message_sent();
	}

	function wachmannBap(msg, user) {
		const guardCooldownMessage = Tools.parseReply(config.bapGuardCooldownAnswer);

		if (discord.control_talked_recently(msg, config.bapGuardType, true, "channel", guardCooldownMessage, undefined, 120000)) {
			bap(msg, user);
		}
	}

	function setCooldown(msg) {
		const cooldownMessage = Tools.parseReply(config.cooldownMessage, [msg.author]);

		if (!discord.has_cooldown(msg.author.id, config.bapType)) {
			discord.set_cooldown(msg.author.id, config.bapType, config.bapTimeout);
			discord.send_cooldown_message(msg, msg.author.id + config.bapType, cooldownMessage, false);
			mi.logger.info(`${msg.author} added to bap cooldown list.`);
		}

		discord.set_message_sent();
	}
});
