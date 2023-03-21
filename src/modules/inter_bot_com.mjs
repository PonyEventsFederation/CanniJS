import { define_module, stop } from "../lib/Module.mjs";
import * as app from "../lib/Application.mjs";
import Tools from "../lib/Tools.mjs";

const config = {
	"ans_boop_guard_response": "%s Sorry...",
	"bapGuardResponse": "Eep! Sorry Wachmann! %s"
};

let wachmann_id;

export const inter_bot_com = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	const wachmann_id = process.env["WACHMANN_ID"];

	discord.client.on("message", msg => {
		if (msg.author.bot && msg.author.id === wachmann_id) {
			check_wachmann_interaction(msg);
		}
	});

	return {
		stop
	};

	function check_wachmann_interaction(msg) {
		if (msg.mentions.has(discord.client.user)) {
			if (Tools.msg_contains(msg, "hey, don't boop me.")) {
				setTimeout(function() {
					msg.channel.send(Tools.parseReply(config.ans_boop_guard_response, [msg.author]));
				}, 2000);
			}

			if (Tools.msg_contains(msg, "what the hay!?")) {
				setTimeout(async function() {
					msg.channel.send(Tools.parseReply(config.bapGuardResponse, [discord.get_emoji("gc_cannishy")]));
				}, 2000);
			}
		}
	}
});
