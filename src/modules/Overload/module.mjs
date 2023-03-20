import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Overload.json" assert { type: "json" };

let total_overload = 0;
let overloads = {};
let types = [];
let total_delay = 0;
let type_delay = 0;
let overload_on = false;

export const overload = define_module(async mi => {
	let overloads = {};

	// TODO remove this var lol
	let types = config.types;
	load_overloader();

	Application.modules.Discord.client.on("message", (msg) => {
		if(Application.modules.Discord.checkUserAccess(msg.author) && check_overload(msg)) {
			Application.modules.Discord.setMessageSent();
			return;
		}
	});

	return {
		stop
	};

	function overload(type, num = 1) {
		return add_to_overload(type, num);
		// use Application.modules.Overload.overload('type');
	};

	function check_overload(msg) {
		if (overload_on) {
			return true;
		} else if (check_total(config.total_limit) || check_types(config.type_limit)) {
			activate_overload(msg);
			return true;
		}
	}

	function check_total(limit) {
		return total_overload >= limit;
	}

	function check_types(limit) {
		let cond = false;
		types.forEach(type => {
			if (overload[type] >= limit) {
				cond = true;
			}
		});
		return cond;
	}

	function load_overloader() {
		types.forEach(type => {
			overload[type] = 0;
		});

		type_delay = config.type_delay;
		total_delay = config.total_delay;
	}

	async function activate_overload(msg) {
		overload_on = true;
		const downtime_ms = config.downtime * 60000;
		const online = config.ans_online_again;
		const answer = config.ans_overload;
		reset_all();
		(await app.modules).discord.client.user.setStatus("idle");
		await Tools.listSender(msg.channel, answer, [2000, 4000, 4000], [config.downtime]);
		(await app.modules).discord.client.user.setStatus("dnd");
		setTimeout(async function() {
			(await app.modules).discord.client.user.setPresence({ status: "online" });
			overload_on = false;
			msg.channel.send(Tools.parseReply(online));
		}, downtime_ms);
	}

	function add_to_overload(type, num = 1) {
		if (overload[type] || overload[type] === 0) {
			overload[type] += num;
			setTimeout(function() {
				overload[type] -= num;
			}, type_delay);
		}
		total_overload += num;
		setTimeout(function() {
			total_overload -= num;
		}, total_delay);
	}

	function reset_all() {
		total_overload = 0;
		overloads = {};
		load_overloader();
	}
});
