import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";

const config = {
	"fantaType": "fanta",
	"fantaAnswers":[
		"There's no wrong way to Fanta size.",
		"♪♫ Is this real life, is this just Fanta sea? ♫♪",
		"I dreamt I was drowning in an ocean of orange soda. \nThank Celestia it was only a Fanta sea.",
		"Soaking a twig in Coke is nice, but soaking a twig in Fanta? \n... Fanta stick.",
		"What's so funny about Fanta?",
		"Fanta is Canni Bot fuel.",
		"Perry doesn't like Fanta jokes...",
		"I think you are Fanta stick.",
		"I've always dreamed of swimming in an ocean of orange soda\nIt's a Fanta sea of mine"
	]
};

export const fanta = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	discord.client.on("message", msg => {
		if (discord.check_user_access(msg.author) && Tools.strContainsWord(msg.content, "fanta") && !Tools.msg_contains(msg, "is best pony")) {
			fanta(msg);
		}
	});

	return {
		stop
	};

	function fanta(msg) {
		if (discord.control_talked_recently(msg, config.fantaType)) {
			const random = Tools.getRandomIntFromInterval(0, config.fantaAnswers.length - 1);
			msg.channel.send(Tools.parseReply(config.fantaAnswers[random]));

			discord.set_message_sent();
		}
	}
});
