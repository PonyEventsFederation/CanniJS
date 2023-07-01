import { Worker, parentPort as _parentPort, isMainThread, workerData } from "worker_threads";
import os from "os";
import Algebrite from "algebrite";
// const Promise = require("bluebird");

// it is safe to cast this into this type because this module will only ever
// be required from the main thread so main will always run so we good

/**
 * @typedef {{
 *    (method: "single", alg: string): Promise<string>
 *    (method: "multi", alg: Array<string>): Promise<string>
 * }} ProcessFn
 */

/**
 * @type {ProcessFn}
 */
export default isMainThread ? main() : /** @type {any} */ (registerworker());

function main() {
	const numworkers = os.cpus().length;
	/**
	  * remove worker from array when in use cause yea lol
	  * @type {Array<{
	  *    worker: Worker;
	  *    id: number;
	  * }>}
	  */
	const workers = [];

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
	 * @param {{ res: string, workerid: number }} processresult
	 */
	function processresult({ res, workerid }) {
		const worker = inprogress[workerid];
		worker.resolve(res);
	}

	Array(numworkers).fill(null).forEach((_, i) => {
		const worker = new Worker(new URL(import.meta.url), { workerData: i });
		workers.push({ worker, id: i });
		worker.on("message", processresult);
	});

	/** @type {ProcessFn} */
	const process = (method, alg) => {
		return new Promise(resolve => {
			const worker = /** @type {typeof workers[number]} */(workers.shift());
			inprogress[worker.id] = {
				worker: worker.worker,
				resolve
			};
			worker.worker.postMessage({ alg, method });
		});
	};

	// Application.emitter.on("stop", () => {
	// 	console.log("AAAAA".repeat(500));
	// 	workers.forEach(({ worker }) => worker.terminate());
	// 	Object.values(inprogress).forEach(({ worker }) => worker.terminate());
	// });

	return process;
}

function registerworker() {
	// worker doesnt export anything cause no need

	/** @type {number} */
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const workerid = workerData;
	let res = "";

	const parentPort = /** @type {NonNullable<typeof _parentPort>} */ (_parentPort);

	/**
	 * @typedef {{
	 *    (p: { method: "single", alg: string } | { method: "multi", alg: Array<string> }): void;
	 * }} CB
	 * @type {CB}
	 */
	const cb = ({ alg, method }) => {
		switch (method) {
			case "single":
				res = Algebrite.run(alg).toString();
				break;
			case "multi":
				alg.forEach(i => res = Algebrite.run(i).toString());
				break;
			default:
				res = "<@379800645571575810> made a mistake in her code";
		}

		Algebrite.clearall();
		parentPort.postMessage({
			res,
			workerid
		});
	};

	parentPort.on("message", cb);
}
