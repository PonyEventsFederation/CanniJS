import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";
import { resolve as resolve_path } from "path";

import config from "../../config/Hype.json" assert { type: "json" };

const path = resolve_path("./src/data/hype.gif")

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
