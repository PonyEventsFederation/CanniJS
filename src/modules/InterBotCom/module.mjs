import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/InterBotCom.json" assert { type: "json" };

let wachmann_id;

export const inter_bot_com = define_module(async mi => {
	const wachmann_id = process.env["WACHMANN_ID"];

	(await app.modules).discord.client.on("message", msg => {
		if (msg.author.bot && msg.author.id === wachmann_id) {
			check_wachmann_interaction(msg);
		}
	});

	return {
		stop
	};

	function check_wachmann_interaction(msg) {
		if (msg.mentions.has(Application.getClient().user)) {
			if (Tools.msg_contains(msg, "hey, don't boop me.")) {
				setTimeout(function() {
					msg.channel.send(Tools.parseReply(config.ans_boop_guard_response, [msg.author]));
				}, 2000);
			}

			if (Tools.msg_contains(msg, "what the hay!?")) {
				setTimeout(async function() {
					msg.channel.send(Tools.parseReply(config.bapGuardResponse, [(await app.modules).discord.get_emoji("gc_cannishy")]));
				}, 2000);
			}
		}
	}
});
