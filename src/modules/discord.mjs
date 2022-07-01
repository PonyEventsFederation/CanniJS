import { define_module, define_start, define_stop } from "../module.mjs";
import { Client } from "discord.js";

let token = process.env["BOT_TOKEN"];
const client = new Client();
// const commands = [];
// const reactions = [];
// const channel_messaged = new Set;
// const talked_recently = new Set;
// const user_blocked = new Set;

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
});

const stop = define_stop(async () => {
	client.destroy();
});

/** @param {string} _token */
function set_bot_token(_token) {
	token = _token;
}

export const discord = define_module({
	start,
	stop,
	set_bot_token
});
