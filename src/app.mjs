import { get_logger } from "./util.mjs";

import { discord } from "./modules/discord.mjs";
import { time_to_galacon } from "./modules/time-to-galacon.mjs";

/** @typedef {import("./module.mjs").Module} Module */

const modules = {
	discord,
	time_to_galacon
};

/** @type {{ [k in keyof typeof modules]: Module }} */
// eslint-disable-next-line no-unused-vars
const typecheck = modules;

let running = false;

const logger = get_logger("app");

export async function run() {
	if (running) return;
	running = true;

	logger.info("starting canni...");
	await start_modules();
	logger.info("canni started");
}

export async function stop() {
	if (!running) return;
	running = false;

	logger.info("stopping canni...");
	await stop_modules();
	logger.info("canni stopped");
}

async function start_modules() {
	logger.debug("starting modules...");

	for (const mod_name in modules) {
		// _mod_name is not typed `keyof typeof modules` because typescript cannot guarantee
		// during runtime that the passed object has extra properties
		// but we set up that object, and the type is derived from the actual object assignment,
		// so we can guarantee it so we do a cast here
		const mod = modules[/** @type {keyof typeof modules} */ (mod_name)];

		if ("start" in mod) {
			const logger = get_logger(mod_name);
			logger.debug(`starting module ${mod_name}...`);
			await mod.start(logger);
		}
		logger.debug(`module ${mod_name} started`);
	}
}

async function stop_modules() {
	logger.debug("stopping modules...");

	for (const mod_name in modules) {
		// see comment in `start_modules`
		const mod = modules[/** @type {keyof typeof modules} */ (mod_name)];
		if ("stop" in mod) {
			const logger = mod.get_logger();
			logger.debug(`stopping module ${mod_name}...`);
			await mod.stop();
		}
		logger.debug(`module ${mod_name} stopped`);
	}
}

export function is_running() {
	return running;
}

/** @type {<T extends keyof modules>(module: T) => modules[T]} */
export function get_module(module) {
	return modules[module];
}
