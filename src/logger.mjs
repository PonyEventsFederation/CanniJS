import { Logger } from "tslog";
import { is_production } from "./util.mjs";
import { brotliCompress, gzip } from "zlib";

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
	if (!param_overrides.attachedTransports) param_overrides.attachedTransports = [];
	param_overrides.attachedTransports.push({
		minLevel,
		transportLogger: {
			silly: arr_log_transport,
			trace: arr_log_transport,
			debug: arr_log_transport,
			info: arr_log_transport,
			warn: arr_log_transport,
			error: arr_log_transport,
			fatal: arr_log_transport
		}
	});

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

/** @typedef {import("tslog").ILogObject} ILogObject */

/** @type {Array<string>} */
const logs = [];

/** @param {ILogObject} log */
function arr_log_transport(log) {
	logs.push(JSON.stringify(log.toJSON()));
}

/**
 * @param {"gzip" | "brotli" | "text"} format
 * @return {Promise<["gzip" | "brotli" | "text", Buffer] | false>}
 */
export async function get_logs(format) {
	const text = fetch_logs_text();

	if (format === "gzip") return ["gzip", await compress_logs(gzip, text)];
	if (format === "brotli") return ["brotli", await compress_logs(brotliCompress, text)];
	if (format === "text" || format === "") return ["text", text];
	else return false;
}

function fetch_logs_text() {
	const newline = Buffer.from("\n", "utf8");
	const buffers = logs.flatMap(l => [Buffer.from(l, "utf8"), newline]);
	return Buffer.concat(buffers);
}

/**
 * @param {(buf: Buffer, cb: import("zlib").CompressCallback) => void} fn
 * @param {Buffer} buf
 * @return {Promise<Buffer>}
 */
async function compress_logs(fn, buf) {
	return await new Promise((res, rej) => fn(
		buf,
		(err, buf) => err ? rej(err) : res(buf)
	));
}
