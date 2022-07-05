import { define_start, define_module } from "../module.mjs";
import { logger_var_init } from "../util.mjs";
import { get_module } from "../app.mjs";
import * as cfg from "../cfg/time-to-galacon.mjs";
import * as texts from "../texts/time-to-galacon.mjs";
import utcToZonedTime from "date-fns-tz/utcToZonedTime";
import {
	differenceInDays,
	differenceInHours,
	differenceInMinutes,
	subDays,
	subHours,
	subMinutes
} from "date-fns";

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
	// const now = utcToZonedTime(new Date(), "europe/berlin");
	const now = new Date();
	let remaining = cfg.galacon_date;

	const days = differenceInDays(remaining, now);
	remaining = subDays(remaining, days);

	const hours_n = differenceInHours(remaining, now);
	remaining = subHours(remaining, hours_n);

	const minutes_n = differenceInMinutes(remaining, now);
	remaining = subMinutes(remaining, minutes_n);

	const hours = hours_n.toString().padStart(2, "0");
	const minutes = minutes_n.toString().padStart(2, "0");

	const status_msg = texts.status_msg(days, hours, minutes);
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
