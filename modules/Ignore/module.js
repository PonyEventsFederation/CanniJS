"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");
const fs = require("fs");
const write_to_file = true;

/** @extends { Module<import("../../config/Ignore.json")> } */
module.exports = class Ignore extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			if (Tools.test_ENV("MAIN_SERVER")) {
				this.guild = Tools.guild_by_id(Application.getClient(), process.env["MAIN_SERVER"]);
			}

			this.load_ignore_ids();

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
		if (this.is_ignored(msg)) {
			if (msg.mentions.has(Application.getClient().user) && this.guild) {
				Application.modules.Discord.setMessageSent();
				return this.ignored_mentioned(msg);
			} else {
				Application.modules.Discord.setMessageSent();
				return this.ignored(msg);
			}
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	ignored(msg) {
		if (Application.modules.Discord.control_talked_recently2({
			msg,
			type: this.config.potato_ignoredType,
			send_message: false,
			target: "message",
			cooldown_timeout: 600000
		})) {
			msg.channel.send(Tools.parseReply(this.config.ans_potato_ignore, msg.author.toString())).then(() => {
				// msg.react(potato_emo);
			});
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	ignored_mentioned(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.potato_ignored_mentionedType, false, "message", undefined, undefined, 600000)) {
			msg.channel.send(Tools.parseReply(this.config.ans_potato_ignored_mentioned, msg.author.toString())).then(() => {
				// msg.react(potato_emo);
			});
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	is_ignored(msg) {
		let cond = false;
		this.ignore_ids.forEach(id => {
			if (id.toString() === msg.author.id.toString()) {
				cond = true;
			}
		});

		return cond;
	}

	load_ignore_ids() {
		/** @type { string } */
		this.id_location = Application.config.config_path + "/application/ignore_ids.json";

		if (!fs.existsSync(this.id_location)) {
			fs.writeFileSync(this.id_location, "[]");
		}

		try {
			/** @type { Array<string> } */
			this.ignore_ids = Tools.loadCommentedConfigFile(this.id_location);
		} catch (e) {
			throw new Error("config of module ... contains invalid json data: " + e.toString());
		}
	}

	/**
	 * @param { string } id
	 */
	ignore_id_add(id) {
		if (!this.ignore_ids.includes(id)) {
			this.ignore_ids.push(id);
			if (write_to_file) {
				fs.writeFile(this.id_location, JSON.stringify(this.ignore_ids), function(err) {
					if (err) throw err;
				});
			}
			return true;
		}
		return false;
	}

	/**
	 * @param { string } id
	 */
	ignore_id_remove(id) {
		if (this.ignore_ids.includes(id)) {
			this.ignore_ids = this.ignore_ids.filter(item => item !== id);
			if (write_to_file) {
				fs.writeFile(this.id_location, JSON.stringify(this.ignore_ids), function(err) {
					if (err) throw err;
				});
			}
			return true;
		}
		return false;
	}
};
