import { Logger } from "tslog";

/** @typedef {import("tslog").ISettingsParam} LoggerSettings */

const env = process.env["NODE_ENV"] === "production"
	? "production"
	: "development";

export function is_development() {
	return env === "development";
}

export function is_production() {
	return env === "production";
}

/**
 * Configuration values. `gc` returns the value used in production (in galacon server), and
 * every other value are values used in development by various maintainers. The default galacon
 * value will be returned if the requested value is not provided. Regular maintainers feel free to
 * add needed types here, update `define_config_value`, and commit it. Ask Autumn if need help.
 *
 * @template T
 * @typedef {{
 *    gc: () => T;
 *    autumn?: () => T;
 * }} ConfigValue
 */

const cfg = process.env["CFG"];

/**
 * Defines a value that changes automatically based on the `CFG` environment variable
 * to dynamically swap out entire configs to make it easier to swap hardcoded IDs for
 * development purposes
 *
 * @template T
 * @param {ConfigValue<T>} val
 * @return {T}
 */
export function define_value(val) {
	if (cfg === "autumn" && val.autumn) return val.autumn();
	else return val.gc();
}

/**
 * @param {string} name
 * @param {LoggerSettings} param_overrides
 */
export function get_logger(name, param_overrides = {}) {
	return new Logger({
		name,
		displayFunctionName: false,
		minLevel: is_production() ? "info" : "silly",
		...param_overrides
	});
}

/**
 * this is undefined, but a helper constant to type the variable as `Logger`
 * without having to manually type out the definitions all the time
 */
export const logger_var_init = /** @type {Logger} */ (/** @type {unknown} */ (undefined));

export const console_log_logger = get_logger("console", {
	overwriteConsole: true,
	logLevelsColors: [
		"bgRedBright",
		"bgRedBright",
		"bgRedBright",
		"bgRedBright",
		"bgRedBright",
		"bgRedBright",
		"bgRedBright"
	]
});
