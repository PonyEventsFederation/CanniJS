// import * as app from "../app.mjs";

import { define_module } from "../module.mjs";
import { Client } from "discord.js";

let token = process.env["BOT_TOKEN"];
const client = new Client();
// const commands = [];
// const reactions = [];
// const channel_messaged = new Set;
// const talked_recently = new Set;
// const user_blocked = new Set;

export const discord = define_module({
	/** @param {string} _token */
	set_bot_token(_token) {
		token = _token;
	},
	async start(logger) {
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
	},
	async stop() {
		client.destroy();
	}
});
