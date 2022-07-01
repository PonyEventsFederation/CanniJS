/** @typedef {import("tslog").Logger} Logger */
/** @typedef {(logger: import("tslog").Logger) => Promise<void>} Start */
/** @typedef {() => Promise<void>} Stop */
/**
 * @typedef {{
 *    start?: Start;
 *    stop?: Stop;
 * }} Module
 */

/** @type {<T extends Module>(mod: T | (() => T)) => T & { get_logger: () => Logger }} */
export function define_module(mod) {
	const initialised = typeof mod === "function"
		? mod()
		: mod;

	/** @type {Logger} */
	let logger = /** @type {any} */ (undefined);

	return {
		...initialised,
		start: async _logger => {
			logger = _logger;
			if ("start" in initialised) await initialised.start(logger);
		},
		get_logger: () => logger
	};
}

/** @param {Start} start */
export function define_start(start) {
	return start;
}

/** @param {Stop} stop */
export function define_stop(stop) {
	return stop;
}
