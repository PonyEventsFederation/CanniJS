import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Holiday.json" assert { type: "json" };

const christmas_date = [12, 25];
const new_year_date = [1, 1];
let wachmann_id;

export const holiday = define_module(async mi => {
	let wachmann_id = process.env["WACHMANN_ID"];

	const cannisanta = (await app.modules).discord.get_emoji("gc_cannisanta");
	const silvester = (await app.modules).discord.get_emoji("gc_cannisilvester");

	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author)) {
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
		if (Application.modules.Discord.controlTalkedRecently(msg, config.christmasType, false, "message")) {
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

		Application.modules.Discord.setMessageSent();
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
			Application.modules.Discord.setMessageSent();
		}
	}

	function new_year_loader(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, config.silvesterType, false, "message")) {
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

		Application.modules.Discord.setMessageSent();
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
			Application.modules.Discord.setMessageSent();
		}
	}
});

export default class Holiday extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			if (Tools.test_ENV("WACHMANN_ID")) {
				wachmann_id = process.env["WACHMANN_ID"];
			}

			Application.modules.Discord.client.on("message", (msg) => {
				this.cannisanta = Application.modules.Discord.getEmoji("gc_cannisanta");
				this.silvester = Application.modules.Discord.getEmoji("gc_cannisilvester");

				if (Application.modules.Discord.checkUserAccess(msg.author)) {
					this.handle(msg);
				}
			});

			return resolve(this);
		});
	}

	handle(msg) {
		if (Tools.check_date(christmas_date, 1) && Tools.msg_contains(msg, "merry christmas")) {
			return this.christmas_loader(msg);
		}

		if (Tools.check_date(new_year_date, 0) && Tools.msg_contains(msg, "happy new year")) {
			return this.new_year_loader(msg);
		}
	}


	christmas_loader(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.christmasType, false, "message")) {
			if (Tools.chancePercent(10)) {
				this.special_christmas(msg);
			} else {
				this.christmas(msg);
			}
		}
	}

	christmas(msg) {
		const random = Tools.getRandomIntFromInterval(0, this.config.christmasAnswer.length - 1);
		msg.channel.send(Tools.parseReply(this.config.christmasAnswer[random], [msg.author, this.cannisanta]));

		Application.modules.Discord.setMessageSent();
	}

	special_christmas(msg) {
		const random = Tools.getRandomIntFromInterval(0, this.config.specialchristmasAnswer.length - 1);
		const answer = this.config.specialchristmasAnswer[random];

		const wachmann_user = Tools.find_user_by_id(msg.guild, wachmann_id);
		if (wachmann_user === null) {
			this.christmas(msg);
		} else {
			if (Array.isArray(answer)) {
				Tools.listSender(msg.channel, answer, [5000], [msg.author, this.cannisanta, wachmann_user]);
			} else {
				msg.channel.send(Tools.parseReply(answer, [msg.author, this.cannisanta]));
			}
			Application.modules.Discord.setMessageSent();
		}
	}

	new_year_loader(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, this.config.silvesterType, false, "message")) {
			if (Tools.chancePercent(30)) {
				this.special_new_year(msg);
			} else {
				this.new_year(msg);
			}
		}
	}

	new_year(msg) {
		const random = Tools.getRandomIntFromInterval(0, this.config.silvesterAnswer.length - 1);
		msg.channel.send(Tools.parseReply(this.config.silvesterAnswer[random], [msg.author, this.silvester]));

		Application.modules.Discord.setMessageSent();
	}

	special_new_year(msg) {
		const random = Tools.getRandomIntFromInterval(0, this.config.specialsilvesterAnswer.length - 1);
		const answer = this.config.specialsilvesterAnswer[random];

		const wachmann_user = Tools.find_user_by_id(msg.guild, wachmann_id);
		if (wachmann_user === null) {
			this.christmas(msg);
		} else {
			if (Array.isArray(answer)) {
				Tools.listSender(msg.channel, answer, [5000], [msg.author, this.silvester, wachmann_user]);
			} else {
				msg.channel.send(Tools.parseReply(answer, [msg.author, this.silvester]));
			}
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
