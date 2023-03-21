import { define_module, stop } from "../lib/Module.mjs";
import * as app from "../lib/Application.mjs";
import Tools from "../lib/Tools.mjs";

const config = {
	"bestPonyAnswer1": [
		"%s %s I am, of course!"
	],
	"bestPonyAnswer2": [
		"%s I sure am!"
	],
	"bestPonyAnswer3": [
		"%s A bizaam isn't a pony, silly..."
	],
	"bestPonyAnswer4": [
		"%s Rude!"
	],
	"bestPonyAnswer5": [
		"%s Is this a GalaCon thing?",
		"%s I'm fuelled by Fanta. Therefore I am best pony.",
		"%s Fanta is a carbonated soft drink and most definitely not a pony..."
	],
	"bestPonyAnswerDefault": [
		"%s Nu-uh. I am best pony!"
	],
	"bestPonyType": "bestPony",
	"canniBestPonyType": "canniBestPony",
	"bizaamBestPonyType": "bizaamBestPony",
	"assFartBestPonyType": "assfartBestPony",
	"fantaBestPonyType": "fantaBestPony",
	"interjectType": "interject"
};


export const best_pony = define_module(async mi => {
	let modules = await app.modules;
	let discord = await modules.discord;

	discord.client.on("message", async msg => {
		if (discord.check_user_access(msg.author) && Tools.msg_contains(msg, " is best pony")) {
			handle(msg)
		}
	});

	return {
		stop
	};

	function handle(msg) {
		if (Tools.msg_contains(msg, "who is best pony")) {
			whoIsBestPony(msg, config.bestPonyType, config.bestPonyAnswer1, "gc_cannibizaam");
		} else if (Tools.msg_contains(msg, "canni is best pony") || Tools.msg_contains(msg, "canni soda is best pony")) {
			whoIsBestPony(msg, config.canniBestPonyType, config.bestPonyAnswer2);
		} else if (/b+i+z+a+m+ is best pony/i.test(msg.content)) {
			whoIsBestPony(msg, config.bizaamBestPonyType, config.bestPonyAnswer3);
		} else if (Tools.msg_contains(msg, "assfart is best pony")) {
			whoIsBestPony(msg, config.assFartBestPonyType, config.bestPonyAnswer4);
		} else if (Tools.msg_contains(msg, "fanta is best pony")) {
			whoIsBestPony(msg, config.fantaBestPonyType, config.bestPonyAnswer5);
		} else {
			whoIsBestPony(msg, config.interjectType, config.bestPonyAnswerDefault);
		}
	}

	function whoIsBestPony(msg, type, answers, emoji = "") {
		if (discord.control_talked_recently(msg, type)) {
			const random = Tools.getRandomIntFromInterval(0, answers.length - 1);
			msg.channel.send(Tools.parseReply(answers[random], [msg.author, discord.get_emoji(emoji)]));

			discord.set_message_sent();
		}
	}
});
