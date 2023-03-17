import Application from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

export default class Fanta extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("message", (msg) => {
				if (Application.modules.Discord.checkUserAccess(msg.author) && Tools.strContainsWord(msg.content, "fanta") && !Tools.msg_contains(msg, "is best pony")) {
					return this.fanta(msg);
				}
			});

			return resolve(this);
		});
	}

	fanta(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.fantaType)) {
			const random = Tools.getRandomIntFromInterval(0, this.config.fantaAnswers.length - 1);
			msg.channel.send(Tools.parseReply(this.config.fantaAnswers[random]));

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
