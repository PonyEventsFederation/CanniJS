"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");
const path = Application.config.rootDir + "/data/hype.gif";

/** @extends { Module<import("../../config/Hype.json")> } */
module.exports = class Hype extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				this.bizaamEmoji = Application.modules.Discord.getEmoji("gc_cannibizaam");
				if (Application.modules.Discord.checkUserAccess(msg.author) && Tools.strContainsWord(msg.content, "hype")) {
					return this.hype(msg);
				}
			});

			return resolve(this);
		});
	}

	hype(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.hypeType, false, undefined, undefined, undefined, 120000)) {
			msg.channel.send(Tools.parseReply(this.config.ans_hype, [this.bizaamEmoji]), { files:[path] });

			Application.modules.Discord.setMessageSent();
		}
	}
};
