import { get_logger } from "./logger.mjs";

const logger = get_logger("module");

global.define_module = function(mod) {
	logger.silly("global define_module function called");
	const initialised = typeof mod === "function"
		? mod()
		: mod;

	let module_logger = logger_var_init;

	return {
		...initialised,
		start: async _logger => {
			module_logger = _logger;
			if ("start" in initialised) await initialised.start(module_logger);
		},
		get_logger: () => module_logger
	};
};

global.define_start = function(start) {
	logger.silly("global define_start function called");
	return start;
};

global.define_stop = function(stop) {
	logger.silly("global define_start function called");
	return stop;
};
