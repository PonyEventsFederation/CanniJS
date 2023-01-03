import { Temporal } from "@js-temporal/polyfill";
import { get_module } from "../app.mjs";
import * as app from "../app.mjs";
import * as cfg from "./time-to-galacon.cfg.mjs";

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

	if (msg.content.toLowerCase().includes(cfg.when_is_galacon_trigger)) {
		msg.channel.send(get_cmd_response());
	}
}

function get_cmd_response() {
	const time_details = get_galacon_time_details();

	return "before_galacon" in time_details
		? cfg.when_command_res_before(time_details.before_galacon)
		: "during_galacon" in time_details
			? cfg.when_command_res_during(time_details.during_galacon)
			: cfg.when_command_res_after(time_details.after_galacon);
}

async function update_status() {
	const time_details = get_galacon_time_details();

	const status_msg = "before_galacon" in time_details
		? cfg.status_msg_before(time_details.before_galacon)
		: "during_galacon" in time_details
			? cfg.status_msg_during(time_details.during_galacon)
			: cfg.status_msg_after(time_details.after_galacon);
	logger.debug(`new message: ${status_msg}`);

	await get_module("discord").set_presence({
		status: "online",
		afk: false,
		activity: {
			name: status_msg
		}
	});
}

/**
 * @return {{
 *    before_galacon: Temporal.Duration;
 * } | {
 *    during_galacon: Temporal.Duration;
 * } | {
 * 	after_galacon: Temporal.Duration;
 * }}
 * Should be always returning positive, if it isn't returning positive then there is a bug
 */
function get_galacon_time_details() {
	const now = Temporal.Now.instant()
		.toZonedDateTimeISO(cfg.local_tz)
		.withTimeZone(cfg.local_tz)
		.toPlainDateTime();

	if (Temporal.PlainDateTime.compare(now, cfg.galacon_start_date) < 0) {
		// before
		logger.debug("now is before galacon");
		return { before_galacon: now.until(cfg.galacon_start_date) };
	}

	if (Temporal.PlainDateTime.compare(now, cfg.galacon_end_date) < 0) {
		// during
		logger.debug("now is during galacon");
		return { during_galacon: now.until(cfg.galacon_end_date) };
	}

	// after
	logger.debug("now is after galacon");
	return { after_galacon: now.since(cfg.galacon_end_date) };
}

export const time_to_galacon = define_module({
	start
});
