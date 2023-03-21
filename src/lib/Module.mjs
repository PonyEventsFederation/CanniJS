// Q: Where is this `./module.js` file?????????
// A: Its actually `./module.d.ts`. Microsoft, why the fuck.
//    No, your excuse of "not wanting to rewrite import paths" is not valid.

/** @type { import("./module.js").define_module } */
export function define_module(mod) {
	return async mi => {
		mi.logger.info("starting...");

		const done = create_deadlock_indicator("initialisation", mi.logger);
		const module = await mod(mi);
		done();

		const original_stop = module.stop;
		module.stop = async () => {
			mi.logger.info("stopping...");

			const done = create_deadlock_indicator("stop", mi.logger);
			await original_stop();
			done();
		};

		return module;
	};
};

/** @type { import("./module.js").define_stop } */
export function define_stop(stop) {
	return stop;
};

/** @type { import("./module.js").Stop } */
export const stop = Promise.resolve;

/**
 * @param { string } thing
 * @param { import("tslog").Logger<void> } logger
 */
function create_deadlock_indicator(thing, logger) {
	let counter = 0;
	const deadlock_detector = setInterval(() => {
		logger.fatal(`${thing}: promise has not resolved, potential deadlock? (~${++counter * 10}s)`);
	}, 10_000);

	return () => {
		clearInterval(deadlock_detector)
		if (counter > 0) {
			logger.info(`${thing}: promise resolved, done, all is good`);
		}
	};
}
