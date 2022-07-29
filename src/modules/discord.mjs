import { Client } from "discord.js";
import { define_module, define_start, define_stop } from "../module.mjs";
import { is_development, logger_var_init } from "../util.mjs";
import * as texts from "./discord.texts.mjs";

// todo set_cooldown
// todo has_cooldown
// todo control_talked_recently
// todo send_cooldown_message

/** @typedef {import("discord.js").ClientEvents} ClientEvents */
/** @typedef {import("discord.js").GuildEmoji} GuildEmoji */
/** @typedef {import("discord.js").Message} Message */
/** @typedef {import("discord.js").PresenceData} PresenceData */
/** @typedef {import("discord.js").User} User */

/** @typedef {(m: Message, rest_of_args: string) => void} CommandHandler */

let token = process.env["BOT_TOKEN"];
const client = new Client();
/**
 * true when the entire bot is ready.
 * @type {boolean | "module initialised" | "discord event received"}
 */
let ready = false;

let logger = logger_var_init;

/** @type {Record<string, CommandHandler>} */
const commands = {};
// const reactions = [];
// const channel_messaged = new Set;
// const talked_recently = new Set;
/** @type {Record<string, NodeJS.Timeout | undefined>} */
const blocked_users = {};
/** @type {Record<string, WeakRef<Message> | undefined>} */
const message_access = {};

const start = define_start(async _logger => {
	logger = _logger;
	client.on("ready", () => {
		logger.info("discord is ready!");
		ready = (ready === "module initialised") || "discord event received";
	});

	client.on("message", msg => {
		// ignore bots
		if (msg.author.bot) return;

		logger.debug("received message");
		logger.debug(`   id: ${msg.id}`);
		logger.debug(`   content: ${msg.content}`);
		logger.debug(`   author: ${msg.author.username}#${msg.author.discriminator}`);
		logger.debug(`   author id: ${msg.author.id}`);

		const prefix = "!";
		let content = msg.content;

		if (!content.startsWith(prefix)) return;
		content = content.substring(prefix.length);

		const next_arg_i = content.indexOf(" ");
		let next_arg = "";
		if (next_arg_i < 0) {
			next_arg = content;
			content = "";
		} else {
			next_arg = content.substring(0, next_arg_i);
			content = content.substring(next_arg_i + 1);
		}

		const cmd = commands[next_arg];
		if (cmd) cmd(msg, content);
	});

	if (!token) {
		const err_str = "no token provided."
			+ " Either set environment var `BOT_TOKEN`,"
			+ " or call `set_bot_token` on the discord module";
		throw new Error(err_str);
	}

	await client.login(token);
	await set_presence({
		status: "online",
		afk: false,
		activity: {
			name: texts.first_activity
		}
	});
	ready = (ready === "discord event received") || "module initialised";
});

const stop = define_stop(async () => {
	client.destroy();
	ready = false;
});

/** @param {string} _token */
function set_bot_token(_token) {
	token = _token;
}

function is_ready() {
	return ready === true;
}

/**
 * finds and returns a guild emoji.
 * Purposefully does not support finding by name.
 *
 * @param {string} id
 * @return {GuildEmoji | undefined}
 */
function get_emoji(id) {
	return client.emojis.resolve(id) || undefined;
}

/**
 * @param {PresenceData} data
 */
async function set_presence(data) {
	return await client.user?.setPresence(data);
}

/**
 * @param {string} cmd the command, eg. "when" for commands like "!when"
 * @param {CommandHandler} handler a handler to handle when this command is invoked.
 */
function add_command(cmd, handler) {
	if (commands[cmd]) {
		const err_msg = `duplicate command registered: ${cmd}`;

		// only throw error in dev
		// don't crash the app if it somehow made it to deploy
		if (is_development()) throw new Error(err_msg);
		else logger.fatal(err_msg);
	}
	commands[cmd] = handler;
}

/**
 * @template {keyof ClientEvents} T
 * @param {T} event
 * @param {(...args: ClientEvents[T]) => void} listener
 */
function on(event, listener) {
	client.on(event, listener);
}

/**
 * @template {keyof ClientEvents} T
 * @param {T} event
 * @param {(...args: ClientEvents[T]) => void} listener
 */
function once(event, listener) {
	client.once(event, listener);
}

/**
 * blocks the user from interacting for a set period of time. This is
 * checked by `check_access`.
 * @param {string} user_id ID of user to block
 * @param {number} time A time (in milliseconds) that the user will automatically be unblocked after
 */
function block_user(user_id, time) {
	const existing = blocked_users[user_id];
	if (existing) {
		clearTimeout(existing);
		delete blocked_users[user_id];
	}

	const timeout = setTimeout(() => delete blocked_users[user_id], time);
	timeout.unref();
	blocked_users[user_id] = timeout;
}

/**
 * @param {string} user_id
 */
function unblock_user(user_id) {
	const user = blocked_users[user_id];
	if (!user) return;

	clearTimeout(user);
	delete blocked_users[user_id];
}

/**
 * @param {string} user_id
 */
function is_user_blocked(user_id) {
	return Boolean(blocked_users[user_id]);
}

/**
 * @param {Message} msg
 */
function check_access(msg) {
	return !msg.author.bot
		&& !is_user_blocked(msg.author.id)
		&& message_send_access_available(msg);
}

/**
 * the amount of time no activity should have happened in galacon for this to run
 * 30 minutes (is arbitrary)
 */
const message_access_refresh_idle = 1000 * 60 * 30;

const message_access_timeout = setTimeout(() => {
	Object.entries(message_access).forEach(([id, msg]) => {
		// if the message is GC'd, that means no one is holding onto it anymore
		// (not even d.js cache) and there is no need to keep track of it anymore
		if (!msg?.deref()) delete message_access[id];
	});
}, message_access_refresh_idle);
message_access_timeout.unref();

/** @param {Message} msg */
function message_send_access_available(msg) {
	message_access_timeout.refresh();
	return !message_access[msg.id];
}

/** @param {Message} msg */
function get_message_send_access(msg) {
	message_access_timeout.refresh();

	const access = message_access[msg.id];
	if (access) return false;

	message_access[msg.id] = new WeakRef(msg);
	return !msg.author.bot;
}

export const discord = define_module({
	start,
	stop,

	// discord api related
	set_bot_token,
	is_ready,
	get_emoji,
	set_presence,

	// functions related to commands
	add_command,

	// event
	on,
	once,

	// user access
	block_user,
	unblock_user,
	is_user_blocked,
	check_access,

	// message reply control
	message_send_access_available,
	get_message_send_access
});
