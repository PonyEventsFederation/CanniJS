import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";
import fs from "fs";

import config from "../../config/Ignore.json" assert { type: "json" };

const write_to_file = true;
let idLocation;
let ignore_ids;
let guild;

export const ignore = define_module(async mi => {
	if (Tools.test_ENV("MAIN_SERVER")) {
		guild = Tools.guild_by_id((await app.modules).discord.client, process.env["MAIN_SERVER"]);
	}

	load_ignore_ids();

	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	function handle(msg) {
		if (is_ignored(msg)) {
			if (msg.mentions.has(Application.getClient().user) && guild) {
				Application.modules.Discord.setMessageSent();
				return ignored_mentioned(msg);
			} else {
				Application.modules.Discord.setMessageSent();
				return ignored(msg);
			}
		}
	}

	function ignored(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, config.potato_ignoredType, false, "message", undefined, undefined, 600000)) {
			msg.channel.send(Tools.parseReply(config.ans_potato_ignore, [msg.author])).then(() => {
				// msg.react(potato_emo);
			});
		}
	}

	function ignored_mentioned(msg) {
		if (Application.modules.Discord.controlTalkedRecently(msg, config.potato_ignored_mentionedType, false, "message", undefined, undefined, 600000)) {
			msg.channel.send(Tools.parseReply(config.ans_potato_ignored_mentioned, [msg.author])).then(() => {
				// msg.react(potato_emo);
			});
		}
	}

	function is_ignored(msg) {
		let cond = false;
		ignore_ids.forEach(function(id) {
			if (id.toString() === msg.author.id.toString()) {
				cond = true;
			}
		});

		return cond;
	}

	function load_ignore_ids() {
		idLocation = Application.config.config_path + "/application/ignore_ids.json";

		if (!fs.existsSync(idLocation)) {
			fs.writeFileSync(idLocation, "[]");
		}

		try {
			ignore_ids = Tools.loadCommentedConfigFile(idLocation);
		} catch (e) {
			throw new Error("config of module ... contains invalid json data: " + e);
		}
	}

	function ignore_id_add(id) {
		if (!ignore_ids.includes(id)) {
			ignore_ids.push(id);
			if (write_to_file) {
				fs.writeFile(idLocation, JSON.stringify(ignore_ids), function(err) {
					if (err) throw err;
				});
			}
			return true;
		}
		return false;
	}

	function ignore_id_remove(id) {
		if (ignore_ids.includes(id)) {
			ignore_ids = ignore_ids.filter(item => item !== id);
			if (write_to_file) {
				fs.writeFile(idLocation, JSON.stringify(ignore_ids), function(err) {
					if (err) throw err;
				});
			}
			return true;
		}
		return false;
	}
});
