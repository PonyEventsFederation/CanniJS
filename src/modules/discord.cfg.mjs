import { define_value } from "../util.mjs";

export const first_activity = define_value({
	gc: () => "Internal systems fully operational",
	autumn: () => "HALLO AUTUMN"
});

export const block_user_timeout_in_secs = 300;

export const cooldown_timeout_in_secs = 60;

/**
 * @param {string} user_id
 * @param {import("discord.js").Emoji} cannierror_emoji
 */
export const cooldown_message_default = (user_id, cannierror_emoji) =>
	`Hello <@${user_id}>! My creators added a 1 minute cooldown to prevent my circuits from overheating.\nPlease let me rest for a moment! ${cannierror_emoji}>`;

/**
 * @param {string} user_id
 * @param {import("discord.js").Emoji} cannishy_emoji
 */
export const cooldown_message_default_dev = (user_id, cannishy_emoji) =>
	`Hello <@${user_id}>! My creators added a 1 min...\nHey, wait a minute! You *are* one of my creators! You already knew this. ${cannishy_emoji}`;
