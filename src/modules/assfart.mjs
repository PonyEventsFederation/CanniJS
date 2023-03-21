import { define_module, stop } from "../lib/Module.mjs";
import * as app from "../lib/Application.mjs";
import Tools from "../lib/Tools.mjs";

const config = {
	"assfartAnswer": [
		"Shut up %s, it's Ausfahrt!"
	],
	"assfartType": "assfart"
};

export const assfart = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	discord.client.on("message", msg => {
		handle(msg);
	});

	return {
		stop
	};

	function handle(msg) {
		if (
			discord.check_user_access(msg.author)
			&& Tools.msg_contains(msg, "assfart")
			&& !Tools.msg_contains(msg, "is best pony")
		) {
			return assFart(msg);
		}
	}

	function assFart(msg) {
		if (discord.control_talked_recently(msg, config.assfartType)) {
			const random = Tools.getRandomIntFromInterval(0, config.assfartAnswer.length - 1);
			msg.channel.send(Tools.parseReply(config.assfartAnswer[random], [msg.author]));

			discord.set_message_sent();
		}
	}
});
