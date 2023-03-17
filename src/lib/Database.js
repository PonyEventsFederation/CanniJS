"use strict";

const Application = require("./Application.js");
const mysql = require("mysql");
const Promise = require("bluebird");
const logger = Application.getLogger("database");
const { Temporal } = require("@js-temporal/polyfill");

/**
 * @type {{ [k: string]: Array<string> }}
 */
const cooldowns = {};

const Database = {
	getTimeout(userId, type) {
		return Promise.resolve((cooldowns[type] = cooldowns[type] || []).includes(userId) ? ["a"] : []);
	},

	setTimeout(userId, type) {
		(cooldowns[type] = cooldowns[type] || []).includes(userId) || cooldowns[type].push(userId);
	}
};

const h_24 = 24 * 60 * 60 * 1000;

function scheduleClearDBTask() {
	const now_temporal_instant = Temporal.Now.instant();
	const current_offset = Temporal.Now.timeZone().getOffsetNanosecondsFor(now_temporal_instant);
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
		for (const key in cooldowns) {
			delete cooldowns[key];
		}
		logger.debug("cleared db");

		// delay to ensure its next day
		setTimeout(scheduleClearDBTask, 10000).unref();
	}, delay).unref();

}

scheduleClearDBTask();

module.exports = Database;
