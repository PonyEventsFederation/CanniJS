import { Temporal } from "@js-temporal/polyfill";
import { define_value, random_from_array as rfa } from "../util.mjs";

/**
 * timezone that the times should be displayed in
 */
export const tz = new Temporal.TimeZone("europe/berlin");

/**
 * timezone that the bot is running in
 */
export const local_tz = Temporal.Now.timeZone();

/**
 * datetime of the next galacon
 */
export const galacon_start_date = new Temporal.PlainDateTime(2022, 7, 30, 10)
	.toZonedDateTime(tz)
	.withTimeZone(local_tz)
	.toPlainDateTime();

/**
 * datetime until the end of ending ceremonies of galacon
 */
export const galacon_end_date = new Temporal.PlainDateTime(2022, 7, 31, 19)
	.toZonedDateTime(tz)
	.withTimeZone(local_tz)
	.toPlainDateTime();

/**
 * update interval for the bot's status message in seconds.
 *
 * I seem to remember this is rate limited to 15 seconds, though it only has a granularity
 * of a minute anyway so I felt a minute was the right interval. The old code used 10 seconds,
 * and the only thing that saved old canni from being banned off of Discord was
 * discord's requirement that you calculate rate limits locally, and discord.js complying
 * and rate limiting for us. - Autumn
 */
export const update_interval_in_secs = define_value({
	gc: () => 60,
	autumn: () => 15
});

/** @typedef {import("@js-temporal/polyfill").Temporal.Duration} Duration */

const before_gc_suffixes = [
	"This is taking forever!",
	"Donate all your hard earned money bills!"
];

/**
 * @param {Duration} ttg Time To Galacon (should be positive)
 */
export function status_msg_before(ttg) {
	const [d, h, m] = get_dhm_processed(ttg);
	return `Time to GalaCon: ${d} days, ${h}:${m} left! Hype!`;
}

/**
 * @param {Duration} tte Time To End of galacon (should be positive)
 */
export function status_msg_during(tte) {
	const [d, h, m] = get_dhm_processed(tte);
	return `Time to GalaCon end: ${d} days, ${h}:${m} left`;
}

/**
 * @param {Duration} tseg Time Since End of Galacon (should be positive)
 */
export function status_msg_after(tseg) {
	const [d, h, m] = get_dhm_processed(tseg);
	return `Time since Galacon Ended: ${d} days, ${h}:${m}`;
}

/**
 * @param {Duration} ttg Time To Galacon (should be positive)
 */
export function when_command_res_before(ttg) {
	const [d, h, m] = get_dhm_unprocessed(ttg);
	return `There are ${d} days, ${h} hours, and ${m} minutes left until the next GalaCon!\n${rfa(before_gc_suffixes)}`;
}

/**
 * @param {Duration} tte Time To End of galacon (should be positive)
 */
export function when_command_res_during(tte) {
	const [d, h, m] = get_dhm_unprocessed(tte);
	return `There are ${d} days, ${h} hours, and ${m} minutes left until GalaCon ends.`;
}

/**
 * @param {Duration} tseg Time Since End of Galacon (should be positive)
 */
export function when_command_res_after(tseg) {
	const [d, h, m] = get_dhm_unprocessed(tseg);
	return `There have been ${d} days, ${h}, and ${m} since the last GalaCon ended. When will the next one begin?`;
}

export const when_is_galacon_trigger = "when is galacon";

/**
 * @param {Duration} d
 * @return {[day: number, hour: number, minute: number]}
 */
function get_dhm_unprocessed(d) {
	return [d.days, d.hours, d.minutes];
}

/**
 * @param {Duration} duration
 * @return {[day: number, hour: string, minute: string]}
 */
function get_dhm_processed(duration) {
	const d = duration.days;

	let h = Math.abs(duration.hours).toString().padStart(2, "0");
	if (duration.hours < 0) h = "-" + h;

	let m = Math.abs(duration.minutes).toString().padStart(2, "0");
	if (duration.minutes < 0) m = "-" + m;

	return [d, h, m];
}
