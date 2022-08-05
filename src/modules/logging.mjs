import { MessageAttachment } from "discord.js";
import * as app from "../app.mjs";
import { get_logs } from "../logger.mjs";
import * as cfg from "./logging.cfg.mjs";

let logger = logger_var_init;

const start = define_start(async _logger => {
	logger = _logger;

	app.get_module("discord").add_command("logs", async (msg, arg) => {
		logger.info(`user ${msg.author.username}#${msg.author.discriminator} (id ${msg.author.id}) requested logs with format "${arg}"`);
		arg = arg.toLowerCase();

		const roles = cfg.authorisation.roles;
		const users = cfg.authorisation.users;

		if (
			!(roles && roles.find(r => Boolean(msg.member?.roles.cache.has(r))))
			&& !(users && users.includes(msg.author.id))
		) {
			await msg.channel.send(cfg.no_access);
			return;
		}

		const buf = await get_logs(/** @type {any} */ (arg));
		if (!buf) {
			await msg.channel.send(cfg.invalid_format);
			return;
		}

		// dammit eslint
		/* eslint-disable indent */
		const ext = buf[0] === "text" ? "txt"
			: buf[0] === "gzip" ? "txt.gz"
			: buf[0] === "brotli" ? "txt.br"
			: "bin";
		/* eslint-enable indent */

		await msg.author.send(cfg.here_you_go, {
			files: [new MessageAttachment(buf[1], `logs.${ext}`)]
		});

		if (msg.channel.type !== "dm") {
			await msg.channel.send(cfg.sending_to_dm);
		}
	});
});

export const logging = define_module({
	start
});
