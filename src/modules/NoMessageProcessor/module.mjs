import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/NoMessageProcessor.json" assert { type: "json" };

const remote_on = false;
const remote_target = null;

export const no_message_processor = define_module(async mi => {
	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	async function handle(msg) {
		// When no message was sent, Canni either says she doesn't understand, or boops someone at random if she's not mentioned.
		if (msg.mentions.has(Application.getClient().user)) {
			if (!remote_on || remote_target !== msg.channel) {
				msg.channel.send(Tools.parseReply(config.stillLearningAnswer, [(await app.modules).discord.get_emoji("gc_cannishy")]));
			}
		} else {
			const random = Tools.getRandomIntFromInterval(0, 500);
			if (random === 10) {
				msg.channel.send(Tools.parseReply(config.randomBoopAnswer, [msg.author]));
			}

			if (random === 42) {
				Application.modules.GamerCanni.letsPlay(msg, config.playGameAnswer);
			}
		}
	}
});
