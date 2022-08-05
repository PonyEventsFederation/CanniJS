import * as app from "../app.mjs";
import * as cfg from "./user-joined.cfg.mjs";

/** @typedef {import("discord.js").GuildMember} GuildMember */
/** @typedef {import("discord.js").TextChannel} TextChannel */

let logger = logger_var_init;

/** @type {TextChannel | undefined} */
let general_channel = undefined;

const start = define_start(async _logger => {
	logger = _logger;

	const discord = app.get_module("discord");

	discord.on("ready", () => {
		get_general_channel();
	});

	app.get_module("discord").on("guildMemberAdd", member => {
		logger.debug(`user joined: ${member.user.username}#${member.user.discriminator}, id ${member.id}`);

		const channel = general_channel || get_general_channel(member);
		if (!channel) {
			logger.debug("not able to resolve general channel");
			return;
		}
		if (!channel.isText()) {
			logger.fatal(`cfg.general_channel_id does not point to a text channel (currently set to ${cfg.general_channel_id})`);
			return;
		}

		setTimeout(
			() => channel.send(cfg.welcome_message(member.id)),
			cfg.welcome_message_delay_in_secs * 1000
		);
	});
});

/**
 * @param {GuildMember} [member]
 */
function get_general_channel(member) {
	const channel = member
		? member.guild
			.channels
			.resolve(cfg.general_channel_id)
		: app.get_module("discord")
			.get_client()
			.channels
			.resolve(cfg.general_channel_id);

	if (!channel) {
		const err_msg = "not able to resolve general channel";

		if (member) logger.fatal(err_msg);
		// no member, means not in context of a guild
		// so may be acceptable that it cannot be resolved?
		else logger.warn(err_msg);

		return;
	}

	if (!channel.isText()) {
		logger.fatal("cfg.general_channel_id does not point to a text channel");
		return;
	}

	if (channel.type === "dm") {
		logger.fatal("cfg.general_channel_id should not point to a DM channel");
		return;
	}

	if (channel.type === "news") {
		logger.fatal("cfg.general_channel_id should not point to a news channel");
		return;
	}

	general_channel = /** @type {TextChannel} */ (channel);
	return /** @type {TextChannel} */ (channel);
}

export const user_joined = define_module({
	start
});
