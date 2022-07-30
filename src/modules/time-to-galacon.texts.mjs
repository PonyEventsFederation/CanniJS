import { random_from_array as rfa } from "../util.mjs";

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
	return `Time since Galacon Ended: ${d} days, ${h}${m}`;
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
