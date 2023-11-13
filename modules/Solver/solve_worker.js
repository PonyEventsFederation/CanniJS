"use strict";

const { Worker, parentPort, isMainThread, workerData } = require("worker_threads");
const os = require("os");
// @ts-expect-error
const Algebrite = require("algebrite");
const Application = require("../../lib/Application");

/** @typedef { (method: "single" | "multi", alg: string) => Promise<string> } ProcessFn */
module.exports = /** @type { ProcessFn } */ (isMainThread ? main() : registerworker());

function main() {
	const log = Application.getLogger("Solver worker pool main");
	/**
     * remove worker from array when in use cause yea lol
     * @type {Array<{
     *    worker: Worker;
     *    id: number;
     * }>}
     */
	const workers = [];
	let next_id = 1;

	/**
     * @type {{
     *    [k: string]: {
     *       worker: Worker;
     *       resolve(res: string): void;
     *    }
     * }}
     */
	const inprogress = {};

	/**
	 * @param { object } param
	 * @param { string } param.res
	 * @param { number } param.id
	 */
	function processresult({ res, id }) {
		log.debug(`received result from worker ${id}`);
		const worker = inprogress[id];
		worker.resolve(res);

		delete inprogress[id];
		workers.push({ worker: worker.worker, id });
	}

	/**
     * @param {"single" | "multi"} method
     * @param {string} alg
     * @returns {Promise<string>}
     */
	function process(method, alg) {
		return new Promise(resolve => {
			let worker = workers.shift();

			if (!worker) {
				log.debug(`creating a new worker (#${next_id})`);

				let id = next_id++;
				let new_worker = new Worker(__filename, { workerData: id });
				new_worker.on("message", processresult);
				worker = { id, worker: new_worker };
			}

			inprogress[worker.id] = {
				worker: worker.worker,
				resolve
			};

			worker.worker.postMessage({ alg, method });
		});
	}

	Application.emitter.on("stop", () => {
		workers.forEach(({ worker }) => worker.terminate());
		Object.values(inprogress).forEach(({ worker }) => worker.terminate());
	});

	return process;
}

function registerworker() {

	/** @type {number} */
	const id = workerData;
	const port = /** @type { NonNullable<typeof parentPort> } */ (parentPort);
	const log = Application.getLogger(`Solver worker pool thread ${id}`);

	port.on("message", ({ alg, method }) => {
		log.debug(`received task`);
		let res = "";

		switch (method) {
			case "single":
				res = Algebrite.run(alg).toString();
				break;
			case "multi":
				// @ts-expect-error
				alg.forEach(i => res = Algebrite.run(i).toString());
				break;
			default:
				res = "<@379800645571575810> made a mistake in her code";
		}

		Algebrite.clearall();
		port.postMessage({ res, id });
	});
}
