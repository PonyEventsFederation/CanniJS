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
