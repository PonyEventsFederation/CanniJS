import { define_module, stop } from "../lib/Module.mjs";
import * as app from "../lib/Application.mjs";
import Tools from "../lib/Tools.mjs";

const config = {
	"potatoType": "potato",
	"bestpotatoType": "bestpotato",
	"phrase_potato": [
		"canni is a potato",
		"canni is potato",
		...generate_equal_sign_messages()
	],
	"phrase_best_potato": [
		"canni is the best potato",
		"canni is best potato",
		"canni > potato",
		"canni >= potato",
		"canni is smartato",
		"canni is best smartato",
		"canni is the best smartato",
		"canni is a smartato"
	],
	"ans_potato": [
		"%s hey, I'm not a potato!\nI'm a smart potato!",
		"%s I'm a smart potato\nA Smartato!",
		"%s I'm the smartest potato around!",
		"%s Smartato! GLaDOS would be proud!",
		"Smartato!"
	],
	"ans_best_potato": [
		"%s I'm the best potato around!",
		"%s I'm the incredible smartato!",
		"%s I'm the smartest potato ever!",
		"%s Indeed. I'm the best potato! GLaDOS would be proud!",
		"%s I'm as smart as GLaDOS, but a lot nicer and friendlier!",
		"The best Smartato!"
	]
};

export const potato = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	const smartato_emo = discord.get_emoji("gc_smartato");
	discord.client.on("message", async msg => {
		if (discord.check_user_access(msg.author)) {
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
		if (discord.control_talked_recently(msg, type)) {
			const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
			msg.channel.send(Tools.parseReply(answerType[random], [msg.author])).then(sentEmbed => {
				potatofy(sentEmbed);
			});
			discord.set_message_sent();
		}
	}

	function potatofy(msg) {
		if (discord.check_user_access(msg.author)) {
			msg.react(smartato_emo);
		}
	}
});

function generate_equal_sign_messages() {
	/** @type {(eqs: string) => string} */
	let joiner = eqs => "canni" + eqs + "potato";

	return ["=", "==", "==="].flatMap(s => {
		return [
			joiner(s),
			joiner(" " + s),
			joiner(s + " "),
			joiner(" " + s + " "),
		];
	});
}
