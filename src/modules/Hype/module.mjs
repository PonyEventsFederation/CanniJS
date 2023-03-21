import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";
import { resolve as resolve_path } from "path";

import config from "../../config/Hype.json" assert { type: "json" };

const path = resolve_path("./src/data/hype.gif")

export const hype = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	let bizaam_emoji = discord.get_emoji("gc_cannibizaam");
	discord.client.on("message", async msg => {
		if (discord.check_user_access(msg.author) && Tools.strContainsWord(msg.content, "hype")) {
			hype(msg);
		}
	});

	return {
		stop
	};

	function hype(msg) {
		if (discord.control_talked_recently(msg, config.hypeType, false, undefined, undefined, undefined, 120000)) {
			msg.channel.send(Tools.parseReply(config.ans_hype, [bizaam_emoji]), { files:[path] });

			discord.set_message_sent();
		}
	}
});
