import { MessageAttachment } from "discord.js";
import * as app from "../app.mjs";
import { get_logs, logger_var_init } from "../logger.mjs";
import { define_module, define_start } from "../module.mjs";
import * as cfg from "./logging.cfg.mjs";
import * as texts from "./logging.texts.mjs";

let logger = logger_var_init;

// no access if none specified
const B = Boolean;
/** @param {string} role */
const role_access = (role) => B(cfg.authorisation.roles && cfg.authorisation.roles.includes(role));
/** @param {string} user */
const user_access = (user) => B(cfg.authorisation.users && cfg.authorisation.users.includes(user));

const start = define_start(async _logger => {
	logger = _logger;

	app.get_module("discord").add_command("logs", async (msg, arg) => {
		logger.info(`user ${msg.author.username}#${msg.author.discriminator} (id ${msg.author.id}) requested logs with format "${arg}"`);
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