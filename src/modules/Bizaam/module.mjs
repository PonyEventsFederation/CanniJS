import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Bizaam.json" assert { type: "json" };

export const bizaam = define_module(async mi => {
	let bizaamEmoji;
	(await app.modules).discord.client.on("message", async msg => {
		bizaamEmoji = (await app.modules).discord.get_emoji("gc_cannibizaam");

		if ((await app.modules).discord.check_user_access(msg.author) &&  /\bb+i+z+a+m+\b/i.test(msg.content) && !Tools.msg_contains(msg, "is best pony")) {
			bizaam(msg);
		}
	});

	return {
		stop
	};

	function bizaam(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, config.bizaamType)) {
			const random = Tools.getRandomIntFromInterval(0, config.bizaamAnswer.length - 1);
			msg.channel.send(Tools.parseReply(config.bizaamAnswer[random], [bizaamEmoji])).then(sentEmbed => {
				sentEmbed.react(bizaamEmoji);
			});

			Application.modules.Discord.setMessageSent();
		}
	}
});