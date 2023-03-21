import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/GamerCanni.json" assert { type: "json" };

export const gamer_canni = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	discord.client.on("message", async msg => {
		if (discord.check_user_access(msg.author)) {
			handle(msg);
		}
	});

	return {
		letsPlay,
		stop
	};

	function handle(msg) {
		if (msg.mentions.has(discord.client.user)) {
			if (Tools.msg_contains(msg, "let's play a game") || Tools.msg_contains(msg, "let's play a game")) {
				if (discord.control_talked_recently(msg, config.playGameType)) {
					return letsPlay(msg);
				}
			}
		}
	}

	function getEmojiName(emoji) {
		switch (emoji) {
		case "👊":
			return "rock";
		case "🖐":
			return "paper";
		case "✌":
			return "scissors";
		case "🦎":
			return "lizard";
		case "🖖":
			return "Spock";
		default:
			return emoji;
		}
	}

	/**
	 * @param { string | null } flavourText
	 * @param { "rps" | "rpsls" | null } gameType
	 */
	function letsPlay(msg, flavourText = null, gameType = null) {
		mi.logger.debug("started playing game");

		if (flavourText === null) {
			flavourText = config.playGameAnswer;
		}

		if (gameType === null) {
			gameType = Math.random() < 0.5 ? "rps" : "rpsls";
		}

		let emojis, gameName;
		switch (gameType) {
		case "rps":
			emojis = ["👊", "🖐", "✌"];
			gameName = config.playTypeRPS;
			break;
		case "rpsls":
			emojis = ["👊", "🖐", "✌", "🦎", "🖖"];
			gameName = config.playTypeRPSLS;
			break;
		default:
			return;
		}

		const canniChoice = getEmojiName(emojis[Math.floor(Math.random() * emojis.length)]);

		msg.channel.send(Tools.parseReply(flavourText, [msg.author, gameName, discord.get_emoji("gc_canniexcited")])).then(sentEmbed => {
			for (let i = 0; i < emojis.length; i++) {
				sentEmbed.react(emojis[i]);
			}

			const filter = (reaction, user) => {
				return emojis.includes(reaction.emoji.name) && user.id === msg.author.id;
			};

			sentEmbed.awaitReactions(filter, { max: 1, time: 30000, errors: ["time"] }).then(collected => {
				const reaction = collected.first();

				const userChoice = getEmojiName(reaction.emoji.name);
				// ?????
				// play(msg, userChoice, canniChoice, emojis);
				play(msg, userChoice, canniChoice);
				mi.logger.info("User chose " + userChoice);
			}).catch(() => {
				mi.logger.info("User decided not to play");
				msg.reply(Tools.parseReply(config.didNotPlayAnswer, [discord.get_emoji("gc_cannishy")]));
			});
		});

		discord.set_message_sent();
	}

	function play(msg, userChoice, canniChoice) {
		let result;
		if (userChoice === canniChoice) {
			result = "tie";
		} else if (userChoice === "rock") {
			if (canniChoice === "scissors" || canniChoice == "lizard") {
				result = "playerWin";
			} else {
				result = "canniWin";
			}
		} else if (userChoice === "paper") {
			if (canniChoice === "rock" || canniChoice == "Spock") {
				result = "playerWin";
			} else {
				result = "canniWin";
			}
		} else if (userChoice === "scissors") {
			if (canniChoice === "paper" || canniChoice == "lizard") {
				result = "playerWin";
			} else {
				result = "canniWin";
			}
		} else if (userChoice === "lizard") {
			if (canniChoice === "paper" || canniChoice == "Spock") {
				result = "playerWin";
			} else {
				result = "canniWin";
			}
		} else if (userChoice === "Spock") {
			if (canniChoice === "scissors" || canniChoice == "rock") {
				result = "playerWin";
			} else {
				result = "canniWin";
			}
		}

		return resultMessage(msg, canniChoice, result);
	}

	function resultMessage(msg, canniChoice, result) {
		switch (result) {
		case "tie":
			msg.channel.send(Tools.parseReply(config.tieMessage, [msg.author, canniChoice, discord.get_emoji("gc_cannihello")]));
			break;
		case "playerWin":
			msg.channel.send(Tools.parseReply(config.playerWinMessage, [msg.author, canniChoice, discord.get_emoji("gc_cannibizaam")]));
			break;
		case "canniWin":
			msg.channel.send(Tools.parseReply(config.canniWinMessage, [msg.author, canniChoice, discord.get_emoji("gc_cannismile")]));
			break;
		}

		discord.set_message_sent();
	}
});
