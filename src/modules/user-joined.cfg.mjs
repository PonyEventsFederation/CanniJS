import { define_value } from "../util.mjs";

export const general_channel_id = define_value({
	gc: () => "602434888880095244",
	autumn: () => "834298528741326869"
});

export const rules_channel_id = define_value({
	gc: () => "602436162447212554",
	autumn: () => "904850358931705876"
});

export const welcome_message_delay_in_secs = 1;

/**
 * @param {string} user_id
 */
export const welcome_message = user_id => `( ͡° ͜ʖ (\\  *BOOPS* <@${user_id}>\nWelcome to the official GalaCon Discord server!\nBe sure to check out our <#${rules_channel_id}>.`;
