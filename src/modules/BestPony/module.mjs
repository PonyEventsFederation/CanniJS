import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/BestPony.json" assert { type: "json" };

export const best_pony = define_module(async mi => {
	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author) && Tools.msg_contains(msg, " is best pony")) {
			handle(msg)
		}
	});

	return {
		stop
	};

	function handle(msg) {
		if (Tools.msg_contains(msg, "who is best pony")) {
			whoIsBestPony(msg, config.bestPonyType, config.bestPonyAnswer1, "gc_cannibizaam");
		} else if (Tools.msg_contains(msg, "canni is best pony") || Tools.msg_contains(msg, "canni soda is best pony")) {
			whoIsBestPony(msg, config.canniBestPonyType, config.bestPonyAnswer2);
		} else if (/b+i+z+a+m+ is best pony/i.test(msg.content)) {
			whoIsBestPony(msg, config.bizaamBestPonyType, config.bestPonyAnswer3);
		} else if (Tools.msg_contains(msg, "assfart is best pony")) {
			whoIsBestPony(msg, config.assFartBestPonyType, config.bestPonyAnswer4);
		} else if (Tools.msg_contains(msg, "fanta is best pony")) {
			whoIsBestPony(msg, config.fantaBestPonyType, config.bestPonyAnswer5);
		} else {
			whoIsBestPony(msg, config.interjectType, config.bestPonyAnswerDefault);
		}
	}

	function whoIsBestPony(msg, type, answers, emoji = "") {
		if (Application.modules.Discord.controlTalkedRecently(msg, type)) {
			const random = Tools.getRandomIntFromInterval(0, answers.length - 1);
			msg.channel.send(Tools.parseReply(answers[random], [msg.author, Application.modules.Discord.getEmoji(emoji)]));

			Application.modules.Discord.setMessageSent();
		}
	}
});
