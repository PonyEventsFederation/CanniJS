import { Temporal } from "@js-temporal/polyfill";
import { get_module } from "../app.mjs";
import { define_module, define_start } from "../module.mjs";
import { logger_var_init } from "../util.mjs";
import * as cfg from "./time-to-galacon.cfg.mjs";
import * as texts from "./time-to-galacon.texts.mjs";

/** @typedef {import("discord.js").Message} Message */

let logger = logger_var_init;

const start = define_start(async _logger => {
	logger = _logger;

	const discord = get_module("discord");
	discord.add_command("when", msg => handle_when(msg));
	discord.on("message", msg => handle_message(msg));
	discord.on("ready", () => {
		const interval = setInterval(update_status, cfg.update_interval_in_secs * 1000);
		interval.unref();
	});
});

/**
 * @param {Message} _msg
 */
function handle_when(_msg) {
	// a
}

/**
 * @param {Message} _msg
 */
function handle_message(_msg) {
	// a
}

async function update_status() {
	const now = Temporal.Now.instant()
		.toZonedDateTimeISO(Temporal.Now.timeZone())
		.withTimeZone(Temporal.Now.timeZone())
		.toPlainDateTime();

	const diff = now.until(cfg.galacon_date);
	const status_msg = texts.status_msg(diff.days, diff.hours, diff.minutes);
	logger.debug(`new message: ${status_msg}`);

	await get_module("discord").set_presence({
		status: "online",
		afk: false,
		activity: {
			name: status_msg
		}
	});
}

export const time_to_galacon = define_module({
	start
});
