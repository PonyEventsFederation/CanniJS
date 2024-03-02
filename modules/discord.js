"use strict";

// @IMPORTS
const Application = require("../lib/Application");
const Module = require("../lib/Module");
const DiscordJS = require("discord.js");
const Tools = require("../lib/Tools");

/** @extends { Module<import("./discord-config.json")> } */
module.exports = class Discord extends Module {
	/** @override */
	init() {
		return new Promise(resolve => {
			this.log.debug("Initializing...");

			/**
			 * @type { Array<{
			 *    cmd: string;
			 *    cb: (msg: import("discord.js").Message) => void;
			 * }> }
			 */
			this.commands = [];
			// this.reactions = [];
			/** @type { Set<string> } */
			this.channelMessaged = new Set();
			/** @type { Set<string> } */
			this.talkedRecently = new Set();
			/** @type { Set<string> } */
			this.userBlocked = new Set();
			this.messageSent = false;

			this.client = new DiscordJS.Client();
			this.client.on("ready", () => {
				this.log.info("Discord Bot is ready to rock!");
			});

			this.client.on("message", (msg) => {
				this.messageSent = false;
				return this.processMessage(msg);
			});

			// // process message again when its updated
			// // disabled cause it caused more problems than it was worth
			// this.client.on('messageUpdate', (_, newmsg) => {
			//     this.client.emit('message', newmsg);
			// });

			this.authToken = this.config.token;
			if (this.authToken === "ENV" && Tools.test_ENV("BOT_TOKEN")) {
				this.authToken = process.env["BOT_TOKEN"];
			} else {
				this.log.fatal("env var BOT_TOKEN is not available, please set it");
				process.exit(1);
			}

			return resolve(this);
		});
	}

	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			return this.client.login(this.authToken).then(() => {
				this.firstActivity();
				return resolve(this);
			}, err => {
				this.log.error(err);
				return resolve(this);
			});
		});
	}

	/** @override */
	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");

			this.client.destroy();

			return resolve(this);
		});
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	processMessage(msg) {
		// No bots allowed
		if (msg.author.bot) {
			return;
		}

		this.log.info("Received message " + msg.content);
		// first we process the commands
		for (let i = 0; i < this.commands.length; i++) {
			const command = this.commands[i];
			if ((msg.mentions.has(this.client.user) && msg.content.toLowerCase().includes(command.cmd)) || msg.content.toLowerCase().startsWith("!" + command.cmd)) {
				return command.cb(msg);
			}
		}
	}

	/**
	 * @param { string } cmd
	 * @param { (msg: import("discord.js").Message) => void } cb
	 */
	addCommand(cmd, cb) {
		this.commands.push({ cmd, cb });
	}

	// addReaction(text, type, cb) {
	// 	this.reactions.push({ text, type, cb });
	// }

	/**
	 * @param { string } type
	 */
	getEmoji(type) {
		const targetEmoji = this.client.emojis.cache.find(emoji => emoji.name.toLowerCase() === type.toLowerCase());

		if (targetEmoji) {
			return targetEmoji;
		}

		Application.log.error(`Emoji ${type} not found`);
		return "";
	}

	/**
	 * @param { string } userId
	 * @param { string } type
	 * @param { number } cooldownTimeout
	 */
	setCooldown(userId, type, cooldownTimeout) {
		this.talkedRecently.add(userId + type);
		setTimeout(() => {
			this.talkedRecently.delete(userId + type);
		}, cooldownTimeout);
	}

	/**
	 * @param { string } userId
	 * @param { string } type
	 */
	hasCooldown(userId, type) {
		return this.talkedRecently.has(userId + type);
	}

	/**
	 * @param { object } p
	 * @param { import("discord.js").Message } p.msg
	 * @param { string } p.type
	 * @param { boolean } [p.send_message] default true
	 * @param { "channel" | "individual" | "message" } [p.target] default "channel"
	 * @param { string } [p.cooldown_message] provide a custom cooldown message;
	 *    otherwise the default will be used
	 * @param { boolean } [p.block_user] default "false"
	 * @param { number } [p.cooldown_timeout] see config for module Discord for
	 *    default value
	 */
	control_talked_recently2({
		msg,
		type,
		send_message = true,
		target = "channel",
		cooldown_message,
		block_user = false,
		cooldown_timeout
	}) {
		return this.controlTalkedRecently(
			msg,
			type,
			send_message,
			target,
			cooldown_message,
			block_user,
			cooldown_timeout
		);
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { string } type
	 * @param { "channel" | "individual" | "message" } target
	 * @param { string } cooldownMessage
	 * @param { number } cooldownTimeout
	 * @deprecated use control_talked_recently2
	 */
	controlTalkedRecently(msg, type, sendMessage = true, target = "channel", cooldownMessage = null, blockUser = false, cooldownTimeout = null) {
		/** @type { string } */
		let cooldownTarget;

		switch (target) {
		case "channel":
			cooldownTarget = msg.channel.id + type;
			break;
		case "individual":
			cooldownTarget = msg.author.id;
			break;
		case "message":
			cooldownTarget = msg.author.id + type;
			break;
		}

		if (this.talkedRecently.has(cooldownTarget)) {
			// Set the default cooldown message if none is passed from another module.
			if (cooldownMessage == null) {
				if (Application.modules.DevCommands.auth_dev(msg.author.id)) {
					cooldownMessage = Tools.parseReply(
						this.config.cooldownMessageDev,
						msg.author.toString(),
						this.getEmoji("gc_cannishy").toString()
					);
				} else {
					cooldownMessage = Tools.parseReply(
						this.config.cooldownMessageDefault,
						msg.author.toString(),
						this.getEmoji("gc_cannierror").toString()
					);
				}
			}

			if (sendMessage) {
				this.sendCooldownMessage(msg, cooldownTarget, cooldownMessage, blockUser);
			}

			return false;
		} else {
			this.talkedRecently.add(cooldownTarget);
			if (cooldownTimeout == null) {
				cooldownTimeout = this.config.cooldownTimeout;
			}
			setTimeout(() => {
				this.talkedRecently.delete(cooldownTarget);
			}, cooldownTimeout).unref();

			return true;
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { string } cooldownTarget
	 * @param { string } cooldownMessage
	 * @param { boolean } blockUser
	 */
	sendCooldownMessage(msg, cooldownTarget, cooldownMessage, blockUser) {
		if (blockUser) {
			this.blockUser(msg.author.id, this.config.blockUserTimeout);
		}

		if (this.channelMessaged.has(cooldownTarget)) {
			// Do nothing. We don't want to spam everyone all the time.
		} else {
			msg.channel.send(cooldownMessage);

			this.channelMessaged.add(cooldownTarget);
			setTimeout(() => {
				this.channelMessaged.delete(cooldownTarget);
			}, this.config.cooldownTimeout);
		}

		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { string } userId
	 * @param { number } blockTimeout
	 */
	blockUser(userId, blockTimeout) {
		this.userBlocked.add(userId);
		setTimeout(() => {
			this.userBlocked.delete(userId);
		}, blockTimeout);
	}

	/**
	 * @param { import("discord.js").User } user
	 */
	checkUserAccess(user) {
		return !(
			user.bot
			|| Application.modules.Discord.isUserBlocked(user.id)
			|| Application.modules.Discord.isMessageSent()
		);
	}

	/**
	 * @param { string } userId
	 */
	unblockUser(userId) {
		if (this.talkedRecently.has(userId)) {
			this.talkedRecently.delete(userId);
		}

		if (this.channelMessaged.has(userId)) {
			this.channelMessaged.delete(userId);
		}

		this.userBlocked.delete(userId);
	}

	/**
	 * @param { string } userId
	 */
	isUserBlocked(userId) {
		return this.userBlocked.has(userId);
	}

	setMessageSent() {
		this.messageSent = true;
	}

	isMessageSent() {
		return this.messageSent;
	}

	firstActivity() {
		const msg = "Internal systems fully operational";
		Application.modules.Discord.client.user.setPresence({
			status: "online",
			afk: false,
			activity: {
				name: msg
			}
		});
	}
};
