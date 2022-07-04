import { Client } from "discord.js";
import { define_module, define_start, define_stop } from "../module.mjs";
import * as texts from "../texts/discord.mjs";
import { logger_var_init } from "../util.mjs";

// todo add_command
// todo add_reaction

// todo set_cooldown
// todo has_cooldown
// todo control_talked_recently
// todo send_cooldown_message

/** @typedef {import("discord.js").ClientEvents} ClientEvents */
/** @typedef {import("discord.js").GuildEmoji} GuildEmoji */
/** @typedef {import("discord.js").Message} Message */
/** @typedef {import("discord.js").User} User */

let token = process.env["BOT_TOKEN"];
const client = new Client();
let ready = false;

let logger = logger_var_init;

// const commands = [];
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
	});

	client.on("message", _msg => {
		// todo do something with this
	});

	if (!token) {
		const err_str = "no token provided."
			+ " Either set environment var `BOT_TOKEN`,"
			+ " or call `set_bot_token` on the discord module";
		throw new Error(err_str);
	}

	await client.login(token);
	await first_activity();
	ready = true;
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
	return ready;
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

const discord_api = {
	set_bot_token,
	is_ready,
	get_emoji
};

/**
 * @typedef {{
 *    <T extends keyof ClientEvents>(
 *       event: T,
 *       listener: (...args: ClientEvents[T]) => void
 *    ): void
 * }} ClientEventCallback
 */

/** @type {ClientEventCallback} */
function on(event, listener) {
	client.on(event, listener);
}

/** @type {ClientEventCallback} */
function once(event, listener) {
	client.once(event, listener);
}

const event = {
	on,
	once
};

/**
 * @param {string} user_id
 * @param {number} time
 */
function block_user(user_id, time) {
	const existing = blocked_users[user_id];
	if (existing) {
		clearTimeout(existing);
		delete blocked_users[user_id];
	}

	const timeout = setTimeout(() => delete blocked_users[user_id], time);
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
		&& get_message_send_access(msg);
}

const user_access = {
	block_user,
	unblock_user,
	is_user_blocked,
	check_access
};

/**
 * the amount of time no activity should have happened in galacon for this to run
 * 30 minutes (is arbitrary)
 */
const message_access_refresh_idle = 1000 * 60 * 30;

const message_access_timeout = setTimeout(() => {
	Object.entries(message_access).forEach(([id, msg]) => {
		if (!msg?.deref()) delete message_access[id];
	});
}, message_access_refresh_idle);

/** @param {Message} msg */
function get_message_send_access(msg) {
	message_access_timeout.refresh();
	const access = message_access[msg.id];
	if (access) return false;

	message_access[msg.id] = new WeakRef(msg);
	return true;
}

const message_reply_control = {
	get_message_send_access
};

async function first_activity() {
	await client.user?.setPresence({
		status: "online",
		afk: false,
		activity: {
			name: texts.first_activity
		}
	});
}

export const discord = define_module({
	start,
	stop,
	...discord_api,
	...event,
	...user_access,
	...message_reply_control
});
