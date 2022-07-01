import { Logger } from "tslog";

const env = process.env["NODE_ENV"] === "production"
	? "production"
	: "development";

export function is_development() {
	return env === "development";
}

export function is_production() {
	return env === "production";
}

/** @type {{ [k: string]: Logger | undefined }} */
const loggers = {};

/**
 * @param {string} name
 * @return {Logger}
 */
export function get_logger(name) {
	let logger = loggers[name];
	if (logger) return logger;

	logger = new Logger({
		name
	});
	loggers[name] = logger;
	return logger;
}
