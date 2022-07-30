import { Logger } from "tslog";
import { is_production } from "./util.mjs";

/** @typedef {import("tslog").ISettingsParam} LoggerSettings */

const dev_level = process.env["NO_SILLY"]
	? "trace"
	: "silly";
const prod_level = process.env["SILLY"]
	? "silly"
	: "info";
const minLevel = is_production()
	? prod_level
	: dev_level;

/**
 * @param {string} name
 * @param {LoggerSettings} param_overrides
 */
export function get_logger(name, param_overrides = {}) {
	return new Logger({
		name,
		minLevel,
		displayFunctionName: false,
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
