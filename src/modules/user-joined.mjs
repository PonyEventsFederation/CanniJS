import * as app from "../app.mjs";
import * as cfg from "./user-joined.cfg.mjs";
import * as texts from "./user-joined.texts.mjs";
import { define_module, define_start } from "../module.mjs";
import { logger_var_init } from "../logger.mjs";

/** @typedef {import("discord.js").GuildMember} GuildMember */

let logger = logger_var_init;

const start = define_start(async _logger => {
	logger = _logger;

	app.get_module("discord").on("guildMemberAdd", member => {
		logger.debug(`user joined: ${member.user.username}#${member.user.discriminator}, id ${member.id}`);

		const general_channel = member.guild.channels.resolve(cfg.general_channel_id);
		if (!general_channel) {
			logger.debug("not able to resolve general channel");
			return;
		}
		if (!general_channel.isText()) {
			logger.fatal(`cfg.general_channel_id does not point to a text channel (currently set to ${cfg.general_channel_id})`);
			return;
		}

		setTimeout(
			() => general_channel.send(texts.welcome_message(member.id)),
			cfg.welcome_message_delay_in_secs * 1000
		);
	});
});

export const user_joined = define_module({
	start
});
