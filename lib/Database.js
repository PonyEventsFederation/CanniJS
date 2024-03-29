"use strict";

const Application = require("./Application.js");
const logger = Application.getLogger("database");
const { Temporal } = require("@js-temporal/polyfill");

/**
 * @type {{ [k: string]: Array<string> }}
 */
const cooldowns = {};

const Database = {
	/**
	 * @param { string } userID
	 * @param { string } type
	 */
	getTimeout(userID, type) {
		return Promise.resolve((cooldowns[type] = cooldowns[type] || []).includes(userID) ? ["a"] : []);
	},

	/**
	 * @param { string } userID
	 * @param { string } type
	 * @deprecated use set_timeout_with_commit instead
	 */
	setTimeout(userID, type) {
		logger.warn("deprecated method Database.setTimeout called");
		Database.set_timeout_with_commit(userID, type)();
	},

	/**
	 * returns a function that can be called to "commit" a timeout, timeout will not
	 * be added before it is called
	 *
	 * @param { string } user_id
	 * @param { string } type
	 */
	set_timeout_with_commit(user_id, type) {
		return () => {
			logger.debug(`adding timeout "${type}" for user id "${user_id}"`);
			(cooldowns[type] = cooldowns[type] || []).includes(user_id) || cooldowns[type].push(user_id);
			return Promise.resolve();
		}
	}
};

const h_24 = 24 * 60 * 60 * 1000;

function scheduleClearDBTask() {
	const now_temporal_instant = Temporal.Now.instant();
	const current_offset = new Temporal.TimeZone(Temporal.Now.timeZoneId()).getOffsetNanosecondsFor(now_temporal_instant);
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

	logger.debug(`clear task scheduled, delay is ${delay}ms`)

	setTimeout(() => {
		logger.debug("clearing db");
		for (const key in cooldowns) {
			delete cooldowns[key];
		}

		// delay to ensure its next day
		setTimeout(scheduleClearDBTask, 10_000).unref();
	}, delay).unref();

}

scheduleClearDBTask();

module.exports = Database;
