import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Fanta.json" assert { type: "json" };

export const fanta = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	discord.client.on("message", msg => {
		if (discord.check_user_access(msg.author) && Tools.strContainsWord(msg.content, "fanta") && !Tools.msg_contains(msg, "is best pony")) {
			fanta(msg);
		}
	});

	return {
		stop
	};

	function fanta(msg) {
		if (discord.control_talked_recently(msg, config.fantaType)) {
			const random = Tools.getRandomIntFromInterval(0, config.fantaAnswers.length - 1);
			msg.channel.send(Tools.parseReply(config.fantaAnswers[random]));

			discord.set_message_sent();
		}
	}
});
