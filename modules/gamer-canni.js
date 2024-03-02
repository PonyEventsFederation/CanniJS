"use strict";

// @IMPORTS
const Application = require("../lib/Application");
const Module = require("../lib/Module");
const Tools = require("../lib/Tools");

/** @extends { Module<import("./gamer-canni-config.json")> } */
module.exports = class GamerCanni extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

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
		if (msg.mentions.has(Application.modules.Discord.client.user)) {
			if (Tools.msg_contains(msg, "let's play a game") || Tools.msg_contains(msg, "let's play a game")) {
				if (Application.modules.Discord.controlTalkedRecently(msg, this.config.playGameType)) {
					return this.letsPlay(msg);
				}
			}
		}
	}

	/**
	 * @param { number } milliseconds
	 */
	sleep(milliseconds) {
		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}

	/**
	 * @param { string } emoji
	 */
	getEmojiName(emoji) {
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
	 * @param { import("discord.js").Message } msg
	 * @param { string } [flavourText]
	 * @param { "rps" | "rpsls" } [gameType]
	 */
	letsPlay(msg, flavourText, gameType) {
		this.log.info("started playing game");

		if (!flavourText) {
			flavourText = this.config.playGameAnswer;
		}

		if (!gameType) {
			gameType = Math.random() < 0.5 ? "rps" : "rpsls";
		}

		/** @type { Array<string> } */
		let emojis;
		/** @type { string } */
		let gameName;
		switch (gameType) {
		case "rps":
			emojis = ["👊", "🖐", "✌"];
			gameName = this.config.playTypeRPS;
			break;
		case "rpsls":
			emojis = ["👊", "🖐", "✌", "🦎", "🖖"];
			gameName = this.config.playTypeRPSLS;
			break;
		default:
			return;
		}

		const canniChoice = this.getEmojiName(emojis[Math.floor(Math.random() * emojis.length)]);

		msg.channel.send(Tools.parseReply(
			flavourText,
			msg.author.toString(),
			gameName,
			Application.modules.Discord.getEmoji("gc_canniexcited").toString()
		)).then(async sentEmbed => {
			for (let i = 0; i < emojis.length; i++) {
				await sentEmbed.react(emojis[i]);
			}

			const filter = (reaction, user) => {
				return emojis.includes(reaction.emoji.name) && user.id === msg.author.id;
			};

			sentEmbed.awaitReactions(filter, { max: 1, time: 30000, errors: ["time"] }).then(collected => {
				const reaction = collected.first();

				const userChoice = this.getEmojiName(reaction.emoji.name);
				this.play(msg, userChoice, canniChoice);
				this.log.info("User chose " + userChoice);
			}).catch(() => {
				this.log.info("User decided not to play");
				msg.reply(Tools.parseReply(
					this.config.didNotPlayAnswer,
					Application.modules.Discord.getEmoji("gc_cannishy").toString()
				));
			});
		});

		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { string } userChoice
	 * @param { string } canniChoice
	 */
	play(msg, userChoice, canniChoice) {
		/** @type { "tie" | "playerWin" | "canniWin" } */
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

		return this.resultMessage(msg, canniChoice, result);
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { string } canniChoice
	 * @param { "tie" | "playerWin" | "canniWin" } result
	 */
	resultMessage(msg, canniChoice, result) {
		switch (result) {
		case "tie":
			msg.channel.send(Tools.parseReply(
				this.config.tieMessage,
				msg.author.toString(),
				canniChoice,
				Application.modules.Discord.getEmoji("gc_cannihello").toString()
			));
			break;
		case "playerWin":
			msg.channel.send(Tools.parseReply(
				this.config.playerWinMessage,
				msg.author.toString(),
				canniChoice,
				Application.modules.Discord.getEmoji("gc_cannibizaam").toString()
			));
			break;
		case "canniWin":
			msg.channel.send(Tools.parseReply(
				this.config.canniWinMessage,
				msg.author.toString(),
				canniChoice,
				Application.modules.Discord.getEmoji("gc_cannismile").toString()
			));
			break;
		}

		Application.modules.Discord.setMessageSent();
	}
};
