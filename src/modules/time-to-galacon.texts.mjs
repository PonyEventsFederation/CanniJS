import * as util from "../util.mjs";

/**
 * @param {number} d
 * @param {number} h
 * @param {number} m
 */
export const status_msg = (d, h, m) =>
	`Time to Galacon: ${d} days, ${
		h.toString().padStart(2, "0")
	}:${
		m.toString().padStart(2, "0")
	} left! Hype!`;

const when_command_response_suffixes = [
	"This is taking forever!",
	"Donate all your hard earned money bills!"
];

/**
 * @param {number} d
 * @param {number} h
 * @param {number} m
 */
export function when_command_response(d, h, m) {
	const suffix = util.random_from_array(when_command_response_suffixes);
	return `There are ${d} days, ${h} hours, and ${m} minutes left until the next GalaCon!\n${suffix}`;
}

export const when_is_galacon_trigger = "when is galacon";
