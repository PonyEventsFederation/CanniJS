import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Greetings.json" assert { type: "json" };

export const greetings = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	discord.client.on("message", (msg) => {
		if (discord.check_user_access(msg.author)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	function handle(msg) {
		if (Tools.msg_contains_list(msg, config.phrase_bye_night)) {
			return sendMessage(msg, config.byenightType, config.ans_bye_night);
		} else if (Tools.msg_contains_list(msg, config.phrase_bye)) {
			return sendMessage(msg, config.byeType, config.ans_bye);
		} else if (Tools.msg_contains_word_list(msg, config.phrase_hello)) {
			return sendMessage(msg, config.helloType, config.ans_hello);
		} else if (Tools.msg_contains_list(msg, config.phrase_hello_morning)) {
			return sendMessage(msg, config.hello_morning_Type, config.ans_hello_morning);
		}
	}

	function sendMessage(msg, type, answerType) {
		if (discord.control_talked_recently(msg, type, false, "channel", undefined, undefined, 90000)) {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			msg.channel.send(Tools.parseReply(answerType[random]));

			discord.set_message_sent();
		}
	}
});
