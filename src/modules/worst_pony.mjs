import { define_module, stop } from "../lib/Module.mjs";
import * as app from "../lib/Application.mjs";
import Tools from "../lib/Tools.mjs";

const config = {
	"canniWorstPonyAnswer": [
		"%s Why are you so mean to me?"
	],
	"canniWorstPonyType": "canniWorstPony",
	"cooldownMessageWorstPony": "%s Fine, I'm not talking to you anymore for a while.",
	"forgiveUserAnswer": [
		"%s %s Oh all right. I forgive you."
	],
	"notSorryAnswer": [
		"%s What're you sorry for? You didn't do anything wrong, did you?"
	],
	"blockTimeout": 300000
};

export const worst_pony = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	discord.client.on("message", msg => {
		handle(msg);
	});

	return {
		stop
	};

	/**
	 * @param {import("discord.js").Message} msg
	 */
	function handle(msg) {
		if (msg.author.bot) {
			return;
		}

		if (msg.mentions.has(/** @type {import("discord.js").ClientUser} */ (discord.client.user))) {
			if (Tools.msg_contains(msg, "i'm sorry") || Tools.msg_contains(msg, "i am sorry") || Tools.msg_contains(msg, "i’m sorry")) {
				return forgiveUser(msg);
			}
		}

		if (discord.check_user_access(msg.author) && Tools.msg_contains(msg, " is worst pony")) {
			return whoIsWorstPony(msg);
		}
	}

	/**
	 * @param {import("discord.js").Message} msg
	 */
	function forgiveUser(msg) {
		if (discord.is_user_blocked(msg.author.id)) {
			const random = Tools.getRandomIntFromInterval(0, config.forgiveUserAnswer.length - 1);
			msg.channel.send(Tools.parseReply(config.forgiveUserAnswer[random], [msg.author, discord.get_emoji("gc_cannilove")]));

			discord.unblock_user(msg.author.id);
		} else {
			const random = Tools.getRandomIntFromInterval(0, config.notSorryAnswer.length - 1);
			msg.channel.send(Tools.parseReply(config.notSorryAnswer[random], [msg.author]));
		}

		discord.set_message_sent();
	}

	/**
	 * @param {import("discord.js").Message} msg
	 */
	function whoIsWorstPony(msg) {
		switch (msg.content.toLowerCase()) {
			case "canni is worst pony":
			case "canni soda is worst pony": {
				const cooldownMessage = Tools.parseReply(config.cooldownMessageWorstPony, [msg.author]);

				if (discord.control_talked_recently(msg, config.canniWorstPonyType, true, "individual", cooldownMessage, true, config.blockTimeout)) {
					const random = Tools.getRandomIntFromInterval(
						0,
						config.canniWorstPonyAnswer.length - 1
					);
					msg.channel.send(Tools.parseReply(
						config.canniWorstPonyAnswer[random],
						[msg.author]
					));

					discord.set_message_sent();
				}
				break;
			}
		}
	}
});
