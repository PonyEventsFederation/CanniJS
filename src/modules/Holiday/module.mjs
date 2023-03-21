import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Holiday.json" assert { type: "json" };

const christmas_date = [12, 25];
const new_year_date = [1, 1];
let wachmann_id;

export const holiday = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	let wachmann_id = process.env["WACHMANN_ID"];

	const cannisanta = discord.get_emoji("gc_cannisanta");
	const silvester = discord.get_emoji("gc_cannisilvester");

	discord.client.on("message", async msg => {
		if (discord.check_user_access(msg.author)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	function handle(msg) {
		if (Tools.check_date(christmas_date, 1) && Tools.msg_contains(msg, "merry christmas")) {
			return christmas_loader(msg);
		}

		if (Tools.check_date(new_year_date, 0) && Tools.msg_contains(msg, "happy new year")) {
			return new_year_loader(msg);
		}
	}


	function christmas_loader(msg) {
		if (discord.control_talked_recently(msg, config.christmasType, false, "message")) {
			if (Tools.chancePercent(10)) {
				special_christmas(msg);
			} else {
				christmas(msg);
			}
		}
	}

	function christmas(msg) {
		const random = Tools.getRandomIntFromInterval(0, config.christmasAnswer.length - 1);
		msg.channel.send(Tools.parseReply(config.christmasAnswer[random], [msg.author, cannisanta]));

		discord.set_message_sent();
	}

	function special_christmas(msg) {
		const random = Tools.getRandomIntFromInterval(0, config.specialchristmasAnswer.length - 1);
		const answer = config.specialchristmasAnswer[random];

		const wachmann_user = Tools.find_user_by_id(msg.guild, wachmann_id);
		if (wachmann_user === null) {
			christmas(msg);
		} else {
			if (Array.isArray(answer)) {
				Tools.listSender(msg.channel, answer, [5000], [msg.author, cannisanta, wachmann_user]);
			} else {
				msg.channel.send(Tools.parseReply(answer, [msg.author, cannisanta]));
			}
			discord.set_message_sent();
		}
	}

	function new_year_loader(msg) {
		if (discord.control_talked_recently(msg, config.silvesterType, false, "message")) {
			if (Tools.chancePercent(30)) {
				special_new_year(msg);
			} else {
				new_year(msg);
			}
		}
	}

	function new_year(msg) {
		const random = Tools.getRandomIntFromInterval(0, config.silvesterAnswer.length - 1);
		msg.channel.send(Tools.parseReply(config.silvesterAnswer[random], [msg.author, silvester]));

		discord.set_message_sent();
	}

	function special_new_year(msg) {
		const random = Tools.getRandomIntFromInterval(0, config.specialsilvesterAnswer.length - 1);
		const answer = config.specialsilvesterAnswer[random];

		const wachmann_user = Tools.find_user_by_id(msg.guild, wachmann_id);
		if (wachmann_user === null) {
			christmas(msg);
		} else {
			if (Array.isArray(answer)) {
				Tools.listSender(msg.channel, answer, [5000], [msg.author, silvester, wachmann_user]);
			} else {
				msg.channel.send(Tools.parseReply(answer, [msg.author, silvester]));
			}
			discord.set_message_sent();
		}
	}
});
