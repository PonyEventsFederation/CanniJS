"use strict";

// const Application = require("./Application.js");
// const mysql = require("mysql");
const Promise = require("bluebird");
// const logger = Application.getLogger("database");
// const pool = mysql.createPool({
// 	connectionLimit: 25,
// 	host: process.env.DATABASE_HOST,
// 	port: process.env.DATABASE_PORT,
// 	user: process.env.DATABASE_USER,
// 	password: process.env.DATABASE_PASS,
// 	database: process.env.DATABASE_NAME,
// 	charset: "utf8mb4"
// });

/** @type {Record<string, Array<string>>} */
const timeouts = {};

const Database = {
	getTimeout(userId, type) {
		return new Promise(function(resolve, reject) {
			// const query = pool.query("SELECT * FROM timeout WHERE user_id = ? and type = ?",
			// [userId, type], function(error, results) {
			// 	if (results === undefined) {
			// 		reject(new Error("Error results is undefined"));
			// 	} else {
			// 		resolve(results);
			// 	}
			// });

			const timeout = timeouts[userId];
			if (timeout && timeout.includes(type)) resolve([userId, type]);
			else reject("nay");

			// logger.debug("Timeout select query: " + query.sql);
		});
	},

	setTimeout(userId, type) {
		return new Promise(function(resolve) {
			// const query = pool.query("INSERT INTO timeout (`user_id`, `type`) VALUES (?, ?)",
			// [userId, type], function(error, results) {
			// 	if(results === undefined) {
			// 		reject(new Error("Error results is undefined"));
			// 	} else {
			// 		resolve(results);
			// 	}
			// });

			(timeouts[userId] = timeouts[userId] || []).push(type);
			resolve();

			// logger.debug("Timeout insert query: " + query.sql);
		});
	}
};

module.exports = Database;
