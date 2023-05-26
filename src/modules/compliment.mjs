import { define_module, stop } from "../lib/Module.mjs";
import * as app from "../lib/Application.mjs";
import Tools from "../lib/Tools.mjs";
import fetch from "node-fetch";

const config = {
	"selfcomplimentType":"selfcomplimentType",
	"usercomplimentType": "usercomplimentType",
	"botcomplimentType": "botcomplimentType",
	"ans_self_compliment_template": "%s %s",
	"ans_user_compliment_template": "Hey %s! %s",
	"ans_bot_compliment": "Oh thanks %s! That's very sweet of you. %s",
	"ans_compliment_dev": "%s Hey, wait a minute! You are one of my creators!\nMaking me compliment you is a bit much, don't you think?",
	"ans_compliment_dev_final": [
		"Okay... Fine...\n%s You are a nice developer.",
		"Okay... Fine...\n%s You are a good programmer.",
		"Okay... Fine...\n%s You don't break me *all* the time."
	],
	"complimentDevTimeout": 7000
};

export const compliment = define_module(async mi => {
	const modules = await app.modules;
	const dev_commands = await modules.dev_commands;
	const discord = await modules.discord;

	let hug_emoji;

	discord.client.on("message", async msg => {
		hug_emoji = discord.get_emoji("gc_cannihug");

		// // @ts-expect-error
		if (discord.check_user_access(msg.author) && msg.mentions.has(discord.client.user)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	async function handle(msg) {
		if (Tools.msg_starts_mentioned(msg, "compliment")) {
			if (!msg.mentions.everyone && msg.mentions.users.array().length > 0) {
				const users = msg.mentions.users.array();

				for (let i = 0; i < users.length; i++) {
					if (discord.check_self(users[i].id)) {
						try {
							const id = Tools.get_id_from_mention(msg.content.split(" ").filter(Boolean)[2]);
							if (msg.mentions.users.array().length === 1 && discord.check_self(id)) {
								compliment_bot(msg);
							}
						} catch (error) {
							// this.log.error(error);
						}

						continue;
					}

					if (users[i].id === msg.author.id) {
						if (discord.auth_dev(msg.author.id)) {
							compliment_dev(msg);
						} else {
							compliment(msg, config.selfcomplimentType, config.ans_self_compliment_template, msg.author);
						}
						continue;
					}

					compliment(msg, config.usercomplimentType, config.ans_user_compliment_template, users[i]);
				}
			}
		}
		if (Tools.msg_starts_mentioned(msg, "compliment me")) {
			if (discord.auth_dev(msg.author.id)) {
				return compliment_dev(msg);
			} else {
				return compliment(msg, config.selfcomplimentType, config.ans_self_compliment_template, msg.author);
			}
		}
	}

	async function compliment(msg, type, answerType, target) {
		if (discord.control_talked_recently(msg, type, true, "message", undefined, undefined, 120000)) {
			getCompliment().then(function(out) {
				msg.channel.send(
					Tools.parseReply(answerType,
						[target, Tools.capitalizeFirstLetter(out["compliment"])]
					));
			});
			discord.set_message_sent();
		}
	}

	async function compliment_bot(msg) {
		if (discord.control_talked_recently(msg, config.botcomplimentType, true, "message", undefined, undefined, 120000)) {
			msg.channel.send(Tools.parseReply(config.ans_bot_compliment, [msg.author, hug_emoji]));
			discord.set_message_sent();
		}
	}


	async function compliment_dev(msg) {
		msg.channel.send(Tools.parseReply(config.ans_compliment_dev, [msg.author])).then(function() {
			setTimeout(() => {
				const random = Tools.getRandomIntFromInterval(0, config.ans_compliment_dev_final.length);
				msg.channel.send(Tools.parseReply(config.ans_compliment_dev_final[random], [msg.author]));
			}, config.complimentDevTimeout);
		});
		discord.set_message_sent();
	}

	function getCompliment() {
		return fetch("https://complimentr.com/api").then(res => res.json()).catch(err => console.error(err));
	}
});
