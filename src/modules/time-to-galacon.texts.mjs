import * as util from "../util.mjs";

/**
 * @param {import("@js-temporal/polyfill").Temporal.Duration} ttg
 */
export function status_msg(ttg) {
	const ttg_sign = ttg.sign;
	if (ttg.sign < 0) ttg = ttg.negated();

	const word = ttg_sign > 0 ? "until" : "since";
	const h = ttg.hours;
	const m = ttg.minutes.toString().padStart(2, "0");
	const d = ttg.days.toString().padStart(2, "0");
	const hype = ttg_sign > 0 ? " Hype!" : "";

	return `Time ${word} GalaCon: ${d} days, ${h}:${m}!${hype}`;
}

const when_command_response_suffixes = [
	"This is taking forever!",
	"Donate all your hard earned money bills!"
];

const suffix = () => util.random_from_array(when_command_response_suffixes);

/**
 * @param {import("@js-temporal/polyfill").Temporal.Duration} ttg
 */
export function when_command_response(ttg) {
	if (ttg.sign > 0) {
		return `There are ${ttg.days} days, ${ttg.hours} hours, and ${ttg.minutes} minutes left until the next GalaCon!\n${suffix()}`;
	} else {
		ttg = ttg.negated();
		return `There have been ${ttg.days} days, ${ttg.hours} hours, and ${ttg.minutes} minutes since the last GalaCon.`;
	}
}

export const when_is_galacon_trigger = "when is galacon";
