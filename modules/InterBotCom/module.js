"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");
let wachmann_id;

/** @extends { Module<import("../../config/InterBotCom.json")> } */
module.exports = class InterBotCom extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			if (Tools.test_ENV("WACHMANN_ID")) {
				wachmann_id = process.env.WACHMANN_ID;
			}

			Application.modules.Discord.client.on("message", (msg) => {
				if (msg.author.bot) {
					if (msg.author.id === wachmann_id) {
						return this.check_wachmann_interaction(msg);
					}
				}
			});

			return resolve(this);
		});
	}

	check_wachmann_interaction(msg) {
		if (msg.mentions.has(Application.getClient().user)) {
			if (Tools.msg_contains(msg, "hey, don't boop me.")) {
				setTimeout(function() {
					msg.channel.send(Tools.parseReply(this.config.ans_boop_guard_response, [msg.author]));
				}.bind(this), 2000);
			}

			if (Tools.msg_contains(msg, "what the hay!?")) {
				setTimeout(function() {
					msg.channel.send(Tools.parseReply(this.config.bapGuardResponse, [Application.modules.Discord.getEmoji("gc_cannishy")]));
				}.bind(this), 2000);
			}
		}
	}
};
