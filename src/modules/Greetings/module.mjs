import { define_module } from "../../lib/Module.mjs";
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

export default class GGGGGreetings extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");
			Application.modules.Discord.client.on("message", (msg) => {
				if (Application.modules.Discord.checkUserAccess(msg.author)) {
					this.handle(msg);
				}
			});

			return resolve(this);
		});
	}

	handle(msg) {
		if (Tools.msg_contains_list(msg, this.config.phrase_bye_night)) {
			return this.sendMessage(msg, this.config.byenightType, this.config.ans_bye_night);
		} else if (Tools.msg_contains_list(msg, this.config.phrase_bye)) {
			return this.sendMessage(msg, this.config.byeType, this.config.ans_bye);
		} else if (Tools.msg_contains_word_list(msg, this.config.phrase_hello)) {
			return this.sendMessage(msg, this.config.helloType, this.config.ans_hello);
		} else if (Tools.msg_contains_list(msg, this.config.phrase_hello_morning)) {
			return this.sendMessage(msg, this.config.hello_morning_Type, this.config.ans_hello_morning);
		}
	}

	sendMessage(msg, type, answerType) {
		if (Application.modules.Discord.controlTalkedRecently(msg, type, false, "channel", undefined, undefined, 90000)) {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			msg.channel.send(Tools.parseReply(answerType[random]));

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
