import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Greetings.json" assert { type: "json" };

export const greetings = define_module(async mi => {
	app.modules
	Application.modules.Discord.client.on("message", (msg) => {
		if (Application.modules.Discord.checkUserAccess(msg.author)) {
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
		if (Application.modules.Discord.controlTalkedRecently(msg, type, false, "channel", undefined, undefined, 90000)) {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			msg.channel.send(Tools.parseReply(answerType[random]));

			Application.modules.Discord.setMessageSent();
		}
	}
});
