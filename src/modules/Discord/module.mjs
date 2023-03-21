import * as app from "../../lib/Application.mjs";
import { define_module } from "../../lib/Module.mjs";
import { Client } from "discord.js";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/Discord.json" assert { type: "json" };

/**
 * @type { Record<string, string> }
 */
const static_emoji_map = {
	gc_cannisanta: "<:gc_cannisanta:659017337269256192>",
	gc_cannisilvester: "<:gc_cannisilvester:661576210056478764>",
	gc_cannihug: "<:gc_cannihug:767446105553502218>",
	gc_cannibizaam: "<:gc_cannibizaam:606565381288493077>"
};

export const discord = define_module(async mi => {
	let commands = [];
	let reactions = [];
	let channel_messaged = new Set();
	let talked_recently = new Set();
	let user_blocked = new Set();
	let message_sent = false;
	let ready = false;

	const client = new Client();
	client.on("ready", () => {
		mi.logger.info("discord client ready!");
		ready = true;
	});

	client.on("message", msg => {
		message_sent = false;
		process_message(msg);
	});

	// This was copy pasted from old code, it may be worth reconsidering?
	// // process message again when its updated
	// // disabled cause it caused more problems than it was worth
	// this.client.on('messageUpdate', (_, newmsg) => {
	//     this.client.emit('message', newmsg);
	// });

	const auth_token = config.token.toLowerCase() === "env"
		? process.env["BOT_TOKEN"]
		: config.token;

	await client.login(auth_token);
	first_activity();








	/**
	 * @return { ReadonlyArray<string> }
	 */
	function get_devs() {
		let devs = [...config.devs];
		devs.push(...config.master_devs);

		return [...new Set(devs)];
	}

	/**
	 * @return { ReadonlyArray<string> }
	 */
	function get_master_devs() {
		return config.master_devs;
	}


	const _dev_ids = [...config.devs];
	_dev_ids.push(...config.master_devs);
	const dev_ids = /** @type { ReadonlyArray<string> } */ (_dev_ids);
	const dev_master_ids = /** @type { ReadonlyArray<string> } */ ([...config.master_devs]);

	return {
		stop,
		add_command,
		auth_dev,
		auth_dev_master,
		check_self,
		check_user_access,
		client,
		control_talked_recently,
		dev_ids,
		get_emoji,
		has_cooldown,
		is_ready,
		is_user_blocked,
		dev_master_ids,
		send_cooldown_message,
		set_cooldown,
		set_message_sent,
		unblock_user
	};

	async function stop() {
		client.destroy();
		ready = false;
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	function process_message(msg) {
		if (msg.author.bot) return;

		mi.logger.debug("received message " + msg.content);

		// commands
		for (const command of commands) {
			// @ts-expect-error
			if ((msg.mentions.has(client.user) && msg.content.toLowerCase().includes(command.cmd)) || msg.content.toLowerCase().startsWith("!" + command.cmd)) {
				return command.cb(msg);
			}
		}
	}

	function is_ready() {
		return ready;
	}

	function add_command(cmd, cb) {
		commands.push({ cmd, cb });
	}

	function add_reaction(text, type, cb) {
		reactions.push({ text, type, cb });
	}

	function get_emoji(emoji_name) {
		const targetEmoji = client.emojis.cache.find(
			emoji => emoji.name.toLowerCase() === emoji_name.toLowerCase()
		);

		if (targetEmoji) return targetEmoji;

		if (static_emoji_map[emoji_name]) {
			mi.logger.debug(`emoji ${emoji_name} found in static emoji map`);
			return static_emoji_map[emoji_name];
		}

		mi.logger.error(`Emoji ${emoji_name} not found`);
		return "";
	}

	function set_cooldown(user_id, type, cooldown_timeout) {
		talked_recently.add(user_id + type);
		setTimeout(() => {
			talked_recently.delete(user_id + type);
		}, cooldown_timeout);
	}

	function set_cooldown(user_id, type, cooldown_timeout) {
		talked_recently.add(user_id + type);
		setTimeout(() => {
			talked_recently.delete(user_id + type);
		}, cooldown_timeout);
	}

	function has_cooldown(user_id, type) {
		return talked_recently.has(user_id + type);
	}

	/**
	 * @param { number | null }cooldown_timeout
	 */
	function control_talked_recently(msg, type, send_message = true, target = "channel", cooldown_message = null, block_user = false, cooldown_timeout = null) {
		let cooldown_target;

		switch (target) {
		case "channel":
			cooldown_target = msg.channel.id + type;
			break;
		case "individual":
			cooldown_target = msg.author.id;
			break;
		case "message":
			cooldown_target = msg.author.id + type;
			break;
		}

		if (talked_recently.has(cooldown_target)) {
			// Set the default cooldown message if none is passed from another module.
			if (cooldown_message == null) {
				if (auth_dev(msg.author.id)) {
					cooldown_message = Tools.parseReply(config.cooldownMessageDev, [msg.author, get_emoji("gc_cannishy")]);
				} else {
					cooldown_message = Tools.parseReply(config.cooldownMessageDefault, [msg.author, get_emoji("gc_cannierror")]);
				}
			}

			if (send_message) {
				send_cooldown_message(msg, cooldown_target, cooldown_message, block_user);
			}

			return false;
		} else {
			talked_recently.add(cooldown_target);
			if (cooldown_timeout === null) {
				cooldown_timeout = config.cooldownTimeout;
			}
			setTimeout(() => {
				talked_recently.delete(cooldown_target);
			}, cooldown_timeout);

			return true;
		}
	}

	function send_cooldown_message(msg, cooldown_target, cooldown_message, _block_user) {
		if (_block_user) {
			block_user(msg.author.id, config.blockUserTimeout);
		}

		if (channel_messaged.has(cooldown_target)) {
			// Do nothing. We don't want to spam everyone all the time.
		} else {
			msg.channel.send(cooldown_message);

			channel_messaged.add(cooldown_target);
			setTimeout(() => {
				channel_messaged.delete(cooldown_target);
			}, config.cooldownTimeout);
		}

		set_message_sent();
	}

	function block_user(userId, blockTimeout) {
		user_blocked.add(userId);
		setTimeout(() => {
			user_blocked.delete(userId);
		}, blockTimeout);
	}

	function check_user_access(user) {
		return !user.bot || is_user_blocked(user.id) || is_message_sent();
	}

	function unblock_user(userId) {
		if (talked_recently.has(userId)) {
			talked_recently.delete(userId);
		}

		if (channel_messaged.has(userId)) {
			channel_messaged.delete(userId);
		}

		user_blocked.delete(userId);
	}

	function is_user_blocked(userId) {
		return user_blocked.has(userId);
	}

	function set_message_sent() {
		message_sent = true;
	}

	function is_message_sent() {
		return message_sent;
	}

	function first_activity() {
		if (!is_ready()) {
			return;
		}

		const msg = "Internal systems fully operational";
		client.user?.setPresence({
			status: "online",
			afk: false,
			activity: {
				name: msg
			}
		});
	}

	function check_self(id) {
		return id === client.user?.id;
	}

	function auth_dev(id) {
		return config.devs.includes(id) || config.master_devs.includes(id);
	}

	function auth_dev_master(id) {
		return config.master_devs.includes(id);
	}
});
