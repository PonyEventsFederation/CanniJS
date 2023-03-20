import { define_module } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Hype.json" assert { type: "json" };

const path = Application.config.rootDir + "/data/hype.gif";

export const hype = define_module(async mi => {
	let bizaam_emoji = (await app.modules).discord.get_emoji("gc_cannibizaam");
	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author) && Tools.strContainsWord(msg.content, "hype")) {
			hype(msg);
		}
	});

	return {
		stop
	};

	function hype(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, config.hypeType, false, undefined, undefined, undefined, 120000)) {
			msg.channel.send(Tools.parseReply(config.ans_hype, [bizaam_emoji]), { files:[path] });

			Application.modules.Discord.setMessageSent();
		}
	}
});

export default class Hype extends Module {
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

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
}
