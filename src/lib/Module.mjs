// Q: Where is this `./module.js` file?????????
// A: Its actually `./module.d.ts`. Microsoft, why the fuck.
//    No, your excuse of "not wanting to rewrite import paths" is not valid.

/** @type { import("./module.js").define_module } */
export function define_module(mod) {
	return async mi => {
		mi.logger.info("starting...");

		const module = await mod(mi);

		const old_stop = module.stop;
		module.stop = async () => {
			mi.logger.info("stopping...");
			await old_stop();
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
