import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";
import fs from "fs";
import path from "path";

const config = {
	"potato_ignoredType": "potato_ignored",
	"potato_ignored_mentionedType": "potato_ignored_mentioned",
	"ans_potato_begin_ignore": "%s All right. I'll ignore whatever they say!",
	"ans_potato_stop_ignore": "%s Got it! I'll stop ignoring them.",
	"ans_potato_ignore": "Don't listen to %s. They're a :potato:.",
	"ans_potato_ignored_mentioned": "%s I'm ignoring you. You :potato:."
};


const write_to_file = true;
let idLocation;
let ignore_ids;
let guild;

export const ignore = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	if (Tools.test_ENV("MAIN_SERVER")) {
		guild = Tools.guild_by_id(discord.client, process.env["MAIN_SERVER"]);
	}

	load_ignore_ids();

	discord.client.on("message", async msg => {
		if (discord.check_user_access(msg.author)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	function handle(msg) {
		if (is_ignored(msg)) {
			if (msg.mentions.has(discord.client.user) && guild) {
				discord.set_message_sent();
				return ignored_mentioned(msg);
			} else {
				discord.set_message_sent();
				return ignored(msg);
			}
		}
	}

	function ignored(msg) {
		if (discord.control_talked_recently(msg, config.potato_ignoredType, false, "message", undefined, undefined, 600000)) {
			msg.channel.send(Tools.parseReply(config.ans_potato_ignore, [msg.author])).then(() => {
				// msg.react(potato_emo);
			});
		}
	}

	function ignored_mentioned(msg) {
		if (discord.control_talked_recently(msg, config.potato_ignored_mentionedType, false, "message", undefined, undefined, 600000)) {
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
		idLocation = path.resolve("./src/config/application/ignore_ids.json");

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
