import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/GamerCanni.json" assert { type: "json" };

export const gamer_canni = define_module(async mi => {
	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	function handle(msg) {
		if (msg.mentions.has(Application.modules.Discord.client.user)) {
			if (Tools.msg_contains(msg, "let's play a game") || Tools.msg_contains(msg, "let's play a game")) {
				if (Application.modules.Discord.controlTalkedRecently(msg, config.playGameType)) {
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

		msg.channel.send(Tools.parseReply(flavourText, [msg.author, gameName, Application.modules.Discord.getEmoji("gc_canniexcited")])).then(sentEmbed => {
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
				msg.reply(Tools.parseReply(config.didNotPlayAnswer, [Application.modules.Discord.getEmoji("gc_cannishy")]));
			});
		});

		Application.modules.Discord.setMessageSent();
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
			msg.channel.send(Tools.parseReply(config.tieMessage, [msg.author, canniChoice, Application.modules.Discord.getEmoji("gc_cannihello")]));
			break;
		case "playerWin":
			msg.channel.send(Tools.parseReply(config.playerWinMessage, [msg.author, canniChoice, Application.modules.Discord.getEmoji("gc_cannibizaam")]));
			break;
		case "canniWin":
			msg.channel.send(Tools.parseReply(config.canniWinMessage, [msg.author, canniChoice, Application.modules.Discord.getEmoji("gc_cannismile")]));
			break;
		}

		Application.modules.Discord.setMessageSent();
	}
});

export default class RockPaperScissors extends Module {
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

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
}
