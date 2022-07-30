import { Temporal } from "@js-temporal/polyfill";
import { define_value } from "../util.mjs";

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
