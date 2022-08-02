import * as cfg from "./user-joined.cfg.mjs";

/** @param {string} user_id */
export const welcome_message = user_id => `( ͡° ͜ʖ (\\  *BOOPS* <@${user_id}>\nWelcome to the official GalaCon Discord server!\nBe sure to check out our <#${cfg.rules_channel_id}>.`;
