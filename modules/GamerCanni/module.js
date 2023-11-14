"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");

/** @extends { Module<import("../../config/GamerCanni.json")> } */
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

	handle(msg) {
		if (msg.mentions.has(Application.modules.Discord.client.user)) {
			if (Tools.msg_contains(msg, "let's play a game") || Tools.msg_contains(msg, "let's play a game")) {
				if (Application.modules.Discord.controlTalkedRecently(msg, this.config.playGameType)) {
					return this.letsPlay(msg);
				}
			}
		}
	}

	sleep(milliseconds) {
		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}

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

	letsPlay(msg, flavourText = null, gameType = null) {
		this.log.info("started playing game");

		if (flavourText === null) {
			flavourText = this.config.playGameAnswer;
		}

		if (gameType === null) {
			gameType = Math.random() < 0.5 ? "rps" : "rpsls";
		}

		let emojis, gameName;
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

		msg.channel.send(Tools.parseReply(flavourText, [msg.author, gameName, Application.modules.Discord.getEmoji("gc_canniexcited")])).then(sentEmbed => {
			for (let i = 0; i < emojis.length; i++) {
				sentEmbed.react(emojis[i]);
			}

			const filter = (reaction, user) => {
				return emojis.includes(reaction.emoji.name) && user.id === msg.author.id;
			};

			sentEmbed.awaitReactions(filter, { max: 1, time: 30000, errors: ["time"] }).then(collected => {
				const reaction = collected.first();

				const userChoice = this.getEmojiName(reaction.emoji.name);
				this.play(msg, userChoice, canniChoice, emojis);
				this.log.info("User chose " + userChoice);
			}).catch(() => {
				this.log.info("User decided not to play");
				msg.reply(Tools.parseReply(this.config.didNotPlayAnswer, [Application.modules.Discord.getEmoji("gc_cannishy")]));
			});
		});

		Application.modules.Discord.setMessageSent();
	}

	play(msg, userChoice, canniChoice) {
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

	resultMessage(msg, canniChoice, result) {
		switch (result) {
		case "tie":
			msg.channel.send(Tools.parseReply(this.config.tieMessage, [msg.author, canniChoice, Application.modules.Discord.getEmoji("gc_cannihello")]));
			break;
		case "playerWin":
			msg.channel.send(Tools.parseReply(this.config.playerWinMessage, [msg.author, canniChoice, Application.modules.Discord.getEmoji("gc_cannibizaam")]));
			break;
		case "canniWin":
			msg.channel.send(Tools.parseReply(this.config.canniWinMessage, [msg.author, canniChoice, Application.modules.Discord.getEmoji("gc_cannismile")]));
			break;
		}

		Application.modules.Discord.setMessageSent();
	}
};
