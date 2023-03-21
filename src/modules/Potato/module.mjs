import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Potato.json" assert { type: "json" };

export const potato = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	const smartato_emo = discord.get_emoji("gc_smartato");
	discord.client.on("message", async msg => {
		if (discord.check_user_access(msg.author)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	function handle(msg) {
		if (Tools.msg_contains_list(msg, config.phrase_potato)) {
			return potato(msg, config.potatoType, config.ans_potato);
		} else if (Tools.msg_contains_list(msg, config.phrase_best_potato)) {
			return potato(msg, config.bestpotatoType, config.ans_best_potato);
		} else if (Tools.msg_contains_list(msg, ["potato", "smartato", "🥔", "🍠"])) {
			return potatofy(msg);
		}
	}

	function potato(msg, type, answerType) {
		if (discord.control_talked_recently(msg, type)) {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			msg.channel.send(Tools.parseReply(answerType[random], [msg.author])).then(sentEmbed => {
				potatofy(sentEmbed);
			});
			discord.set_message_sent();
		}
	}

	function potatofy(msg) {
		if (discord.check_user_access(msg.author)) {
			msg.react(smartato_emo);
		}
	}
});
