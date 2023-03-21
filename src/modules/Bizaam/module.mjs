import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";

const config = {
	"bizaamAnswer": [
		"%s BIIZAAAAAMM!!!"
	],
	"bizaamType": "bizaamType"
};

export const bizaam = define_module(async mi => {
	let modules = await app.modules;
	let discord = await modules.discord;

	let bizaamEmoji;
	discord.client.on("message", async msg => {
		bizaamEmoji = discord.get_emoji("gc_cannibizaam");

		if (discord.check_user_access(msg.author) &&  /\bb+i+z+a+m+\b/i.test(msg.content) && !Tools.msg_contains(msg, "is best pony")) {
			bizaam(msg);
		}
	});

	return {
		stop
	};

	function bizaam(msg) {
		if (discord.control_talked_recently(msg, config.bizaamType)) {
			const random = Tools.getRandomIntFromInterval(0, config.bizaamAnswer.length - 1);
			msg.channel.send(Tools.parseReply(config.bizaamAnswer[random], [bizaamEmoji])).then(sentEmbed => {
				sentEmbed.react(bizaamEmoji);
			});

			discord.set_message_sent();
		}
	}
});
