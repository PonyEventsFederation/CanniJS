import { get_logger } from "./util.mjs";

const modules = {};
let running = false;

let logger = get_logger("app");

export function run() {
	if (running) return;
	running = true;

	// todo
}

export function stop() {
	if (!running) return;
	running = false;
	// todo
}

export function is_running() {
	return running;
}

/** @type {<T extends keyof modules>(module: T) => modules[T]} */
export function get_module(module) {
	// @ts-expect-error
	return modules[module];
}
