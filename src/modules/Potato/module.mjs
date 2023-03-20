import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Potato.json";

export const potato = define_module(async mi => {
	const smartato_emo = (await app.modules).discord.get_emoji("gc_smartato");
	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author)) {
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
		if (Application.modules.Discord.controlTalkedRecently(msg, type)) {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			msg.channel.send(Tools.parseReply(answerType[random], [msg.author])).then(sentEmbed => {
				potatofy(sentEmbed);
			});
			Application.modules.Discord.setMessageSent();
		}
	}

	function potatofy(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author)) {
			msg.react(smartato_emo);
		}
	}
});

export default class Potato extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				this.smartato_emo = Tools.getEmoji(Application.getClient(), "gc_smartato");

				if (Application.modules.Discord.checkUserAccess(msg.author)) {
					this.handle(msg);
				}
			});

			return resolve(this);
		});
	}

	handle(msg) {
		if (Tools.msg_contains_list(msg, this.config.phrase_potato)) {
			return this.potato(msg, this.config.potatoType, this.config.ans_potato);
		} else if (Tools.msg_contains_list(msg, this.config.phrase_best_potato)) {
			return this.potato(msg, this.config.bestpotatoType, this.config.ans_best_potato);
		} else if (Tools.msg_contains_list(msg, ["potato", "smartato", "🥔", "🍠"])) {
			return this.potatofy(msg);
		}
	}

	potato(msg, type, answerType) {
		if (Application.modules.Discord.controlTalkedRecently(msg, type)) {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			msg.channel.send(Tools.parseReply(answerType[random], [msg.author])).then(sentEmbed => {
				this.potatofy(sentEmbed);
			});
			Application.modules.Discord.setMessageSent();
		}
	}

	potatofy(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author)) {
			msg.react(this.smartato_emo);
		}
	}

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
}
