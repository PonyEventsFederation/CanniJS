import * as tools from "./Tools.mjs";
import { Temporal } from "@js-temporal/polyfill";

const logger = tools.get_logger("database");

/**
 * @type {Map<string, Array<string>>}
 */
const cooldowns = new Map();

const Database = {
	/**
	 * @param {string} userId
	 * @param {string} type
	 */
	getTimeout(userId, type) {
		return Promise.resolve(cooldowns.get(type)?.includes(userId) ? ["a"] : []);
	},

	/**
	 * @param {string} userId
	 * @param {string} type
	 */
	setTimeout(userId, type) {
		const cooldown = cooldowns.get(type);
		if (cooldown) return cooldown.includes(userId);
		cooldowns.set(type, [userId]);
		return false;
	}
};

const h_24 = 24 * 60 * 60 * 1000;

function scheduleClearDBTask() {
	const now_temporal_instant = Temporal.Now.instant();
	const current_timezone = new Temporal.TimeZone(Temporal.Now.timeZoneId());
	const current_offset = current_timezone.getOffsetNanosecondsFor(now_temporal_instant);
	const berlin_offset = (new Temporal.TimeZone("europe/berlin")).getOffsetNanosecondsFor(now_temporal_instant);
	const offset_to_berlin_nanos = berlin_offset - current_offset;
	const offset_to_berlin = offset_to_berlin_nanos / 1_000_000;

	// https://stackoverflow.com/a/22536737

	const date = new Date();
	const now_ms = +date;
	date.setHours(0, 0, 0, 0);
	date.setMilliseconds(date.getMilliseconds() + h_24);
	const midnight_ms = +date;
	let delay = midnight_ms - now_ms - offset_to_berlin;
	if (delay < 0) delay += h_24;

	logger.debug(`clear task scheduled, delay is ${delay}ms`);

	setTimeout(() => {
		cooldowns.clear();
		logger.debug("cleared db");

		// delay to ensure its next day
		setTimeout(scheduleClearDBTask, 10000).unref();
	}, delay).unref();

}

scheduleClearDBTask();

export default Database;
