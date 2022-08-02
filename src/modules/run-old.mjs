import { define_module, define_start, define_stop } from "../module.mjs";
import { logger_var_init } from "../logger.mjs";
import { spawn } from "child_process";

/** @type {import("child_process").ChildProcess} */
let child_process;
let logger = logger_var_init;

const start = define_start(async _logger => {
	logger = _logger;

	spawn_old_bot();
});

const stop = define_stop(() => {
	return new Promise(res => {
		child_process.once("exit", code => {
			if (code && !process.exitCode) process.exitCode = code;
			res();
		});

		child_process.kill("SIGTERM");
	});
});

function spawn_old_bot() {
	const spawned = spawn("node", ["main.js"], {
		cwd: process.cwd(),
		env: process.env,
		stdio: "inherit"
	});

	spawned.once("exit", (code, signal) => {
		if (signal) {
			logger.info(`old canni was killed with ${signal}`);
			if (code) logger.info(`exit code: ${code}`);
		} else {
			logger.error("old canni died unexpectedly!");
			if (code) logger.error(`exit code: ${code}`);
			spawn_old_bot();
		}
	});

	child_process = spawned;
}

export const run_old = define_module({
	start,
	stop
});
