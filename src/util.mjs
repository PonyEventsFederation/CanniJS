import { randomBytes } from "crypto";

const env = process.env["NODE_ENV"] === "production"
	? "production"
	: "development";

export const development = env === "development";
export const production = env === "production";

/**
 * Configuration values. `gc` returns the value used in production (in galacon server), and
 * every other value are values used in development by various maintainers. The default galacon
 * value will be returned if the requested value is not provided. Regular maintainers feel free to
 * add needed types here, update {@link define_value}, and commit it. Ask Autumn if need help.
 *
 * @template T
 * @typedef {{
 *    gc: () => T;
 *    autumn?: () => T;
 * }} ConfigValue
 */
const cfg = process.env["CFG"]?.toLowerCase();

/**
 * Defines a value that changes automatically based on the `CFG` environment variable
 * to dynamically swap out hardcoded values for development purposes. See {@link ConfigValue}
 *
 * @template T
 * @param {ConfigValue<T>} val
 * @return {T}
 */
export function define_value(val) {
	if (cfg === "autumn" && val.autumn) return val.autumn();
	else return val.gc();
}

export function random() {
	return randomBytes(1)[0];
}

export function random_in_interval(min = 0, max = 100, int = true) {
	const range = max - min;

	let generated = random();
	generated = generated * range / 256;
	generated = generated + min;
	if (int) generated = Math.floor(generated);

	return generated;
}

/**
 * @template T
 * @param {Array<T>} arr
 */
export function random_from_array(arr) {
	return arr[random_in_interval(0, arr.length)];
}
