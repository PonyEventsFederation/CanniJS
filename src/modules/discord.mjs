import { define_module, define_start, define_stop } from "../module.mjs";
import { Client } from "discord.js";
import * as texts from "../texts/discord.mjs";

let token = process.env["BOT_TOKEN"];
const client = new Client();
let ready = false;

// const commands = [];
// const reactions = [];
// const channel_messaged = new Set;
// const talked_recently = new Set;
// const user_blocked = new Set;
// let message_sent = false;

const start = define_start(async logger => {
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


/** @typedef {import("discord.js").ClientEvents} ClientEvents */
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

function is_ready() {
	return ready;
}

// add_command
// add_reaction
// get_emoji
// set_cooldown
// has_cooldown
// control_talked_recently
// send_cooldown_message
// block_user
// check_user_access
// unblock_user
// is_user_blocked
// set_message_sent
// is_message_sent

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
	set_bot_token,
	on,
	once,
	is_ready
});
