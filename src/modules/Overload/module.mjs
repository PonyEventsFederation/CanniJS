import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";

const config = {
	"types": [
		"boop",
		"bap",
		"hug"
	],
	"total_delay": 60000,
	"type_delay": 90000,
	"total_limit": 25,
	"type_limit": 20,
	"ans_overload": [
		"**Warning!**",
		"Too many commands processing!",
		"Error!\nCPU overloaded!\n\nError!\nERROR-40\nERROR 404\nERROR 418\nERROR 500\n\nError!\nError caused in OSI Layer 8",
		"**Core System Crashed**\nInitiating reboot and system repair.\nInternal repair finished in %s minutes."
	],
	"downtime": 4,
	"ans_online_again": "System repair and reboot complete.\nCanni is online."
};

let total_overload = 0;
let overloads = {};
let types = [];
let total_delay = 0;
let type_delay = 0;
let overload_on = false;

export const overload = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	let overloads = {};

	// TODO remove this var lol
	let types = config.types;
	load_overloader();

	discord.client.on("message", (msg) => {
		if(discord.check_user_access(msg.author) && check_overload(msg)) {
			discord.set_message_sent();
			return;
		}
	});

	return {
		stop,
		overload
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
		discord.client.user.setStatus("idle");
		await Tools.listSender(msg.channel, answer, [2000, 4000, 4000], [config.downtime]);
		discord.client.user.setStatus("dnd");
		setTimeout(async function() {
			discord.client.user.setPresence({ status: "online" });
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
