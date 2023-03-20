import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/RoutineMessages.json" assert { type: "json" };

let target;
let inactive = true;
let interval;

export const routine_messages = define_module(async mi => {
	let target = process.env["GENERAL_CHAT"]
		? await (await app.modules).discord.client.channels.fetch(process.env["GENERAL_CHAT"])
		: undefined;
	let interval = config.m_time_imterval;

	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author) && inactive && target) {
			if (checkTime()) {
				inactive = false;
				startMaintenance();
			}
		}
	});

	return {
		stop
	};

	function checkTime() {
		const now = new Date();
		return now.hour > interval[0] && now.hour < interval[1];
	}

	function specificTimer(time) {
		const hour = time[0];
		const minute = time[1];
		const now = new Date();
		let millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0) - now;
		if (millisTill10 < 0) {
			millisTill10 += 86400000;
		}

		setTimeout(function() {
			if (Tools.getRandomIntFromInterval(0, 100) <= 10) {
				sendMaintenance();
			}
		}, millisTill10);

		let millis = new Date(now.getFullYear(), now.getMonth(), now.getDate(), interval[1], 5, 0, 0) - now;
		if (millis < 0) {
			millis += 86400000;
		}

		if (millis > 0) {
			setTimeout(function() {
				inactive = true;
			}, millis);
		}
	}

	function startMaintenance() {
		const hour = Tools.getRandomIntFromInterval(interval[0], interval[1]);
		const minute = Tools.getRandomIntFromInterval(0, 60);
		specificTimer([hour, minute]);
	}

	function sendMaintenance() {
		const random = Tools.getRandomIntFromInterval(0, config.ans_m.length - 1);
		processMaintenance(config.ans_m[random]);
	}

	function processMaintenance(data) {
		if (Array.isArray(data)) {
			Tools.listSender(target, data, 15000);
		} else {
			target.send(data);
		}
	}
});
