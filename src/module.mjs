/** @typedef {import("tslog").Logger} Logger */
/**
 * @typedef {{
 *    start?: (logger: import("tslog").Logger) => Promise<void>;
 *    stop?: () => Promise<void>;
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
