import { define_value } from "../util.mjs";
import { define_module, define_start } from "../module.mjs";
import { get_logs, logger_var_init } from "../logger.mjs";
import * as app from "../app.mjs";
import * as texts from "./logging.texts.mjs";
import { MessageAttachment } from "discord.js";

let logger = logger_var_init;

/**
 * @typedef {{
 *    roles?: Array<string>;
 *    users?: Array<string>;
 * }} Authorisation
 */
const authorisation = define_value({
	gc: () => /** @type {Authorisation} */({
		roles: [
			// botmaster
			"606867822441791512",
			// mod
			"623927417056002073",
			// admin
			"602442933416755201"
		],
		users: [
			// Autumn c:
			"379800645571575810"
		]
	}),
	autumn: () => ({
		users: [
			// Autumn c:
			"379800645571575810"
		]
	})
});

// no access if none specified
/** @param {string} role */
const role_access = (role) => Boolean(authorisation.roles && authorisation.roles.includes(role));
/** @param {string} user */
const user_access = (user) => Boolean(authorisation.users && authorisation.users.includes(user));

const start = define_start(async _logger => {
	logger = _logger;

	app.get_module("discord").add_command("logs", async (msg, arg) => {
		logger.info(`user ${msg.author.username}#${msg.author.discriminator} (id ${msg.author.id}) requested logs with format ${arg}`);
		arg = arg.toLowerCase();

		if (!role_access(msg.author.id) && !user_access(msg.author.id)) {
			await msg.channel.send(texts.no_access);
			return;
		}

		const buf = await get_logs(/** @type {any} */ (arg));
		if (!buf) {
			await msg.channel.send(texts.invalid_format);
			return;
		}

		// dammit eslint
		/* eslint-disable indent */
		const ext = buf[0] === "text" ? "txt"
			: buf[0] === "gzip" ? "txt.gz"
			: buf[0] === "brotli" ? "txt.br"
			: "bin";
		/* eslint-enable indent */

		await msg.author.send(texts.here_you_go, {
			files: [new MessageAttachment(buf[1], `logs.${ext}`)]
		});

		if (msg.channel.type !== "dm") {
			await msg.channel.send(texts.sending_to_dm);
		}
	});
});

export const logging = define_module({
	start
});
