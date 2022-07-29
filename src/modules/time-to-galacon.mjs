import { Temporal } from "@js-temporal/polyfill";
import { get_module } from "../app.mjs";
import { define_module, define_start } from "../module.mjs";
import { logger_var_init } from "../util.mjs";
import * as app from "../app.mjs";
import * as cfg from "./time-to-galacon.cfg.mjs";
import * as texts from "./time-to-galacon.texts.mjs";

/** @typedef {import("discord.js").Message} Message */

let logger = logger_var_init;

const start = define_start(async _logger => {
	logger = _logger;

	const discord = get_module("discord");
	discord.add_command("when", handle_when);
	discord.on("message", handle_message);
	discord.on("ready", () => {
		const interval = setInterval(update_status, cfg.update_interval_in_secs * 1000);
		interval.unref();
	});
});

/**
 * @param {Message} msg
 */
function handle_when(msg) {
	if (!app.get_module("discord").get_message_send_access(msg)) return;
	msg.channel.send(get_cmd_response());
}

/**
 * @param {Message} msg
 */
function handle_message(msg) {
	if (!app.get_module("discord").get_message_send_access(msg)) return;

	if (msg.content.toLowerCase().includes(texts.when_is_galacon_trigger)) {
		msg.channel.send(get_cmd_response());
	}
}

function get_cmd_response() {
	const ttg = get_time_to_galacon();
	return texts.when_command_response(ttg);
}

async function update_status() {
	const ttg = get_time_to_galacon();
	const status_msg = texts.status_msg(ttg);
	logger.debug(`new message: ${status_msg}`);

	await get_module("discord").set_presence({
		status: "online",
		afk: false,
		activity: {
			name: status_msg
		}
	});
}

function get_time_to_galacon() {
	const tz = Temporal.Now.timeZone();
	const now = Temporal.Now.instant()
		.toZonedDateTimeISO(tz)
		.withTimeZone(tz)
		.toPlainDateTime();

	return now.until(cfg.galacon_date);
}

export const time_to_galacon = define_module({
	start
});
