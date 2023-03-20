import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Assfart.json" assert { type: "json" };

export const assfart = define_module(async mi => {
	(await app.modules).discord.client.on("message", msg => {
		handle(msg);
	});

	return {
		stop
	};

	function handle(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author) && Tools.msg_contains(msg, "assfart") && !Tools.msg_contains(msg, "is best pony")) {
			return assFart(msg);
		}
	}

	function assFart(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, config.assfartType)) {
			const random = Tools.getRandomIntFromInterval(0, config.assfartAnswer.length - 1);
			msg.channel.send(Tools.parseReply(config.assfartAnswer[random], [msg.author]));

			Application.modules.Discord.setMessageSent();
		}
	}
});
