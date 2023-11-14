"use strict";

const Application = require("./lib/Application");
const stage = (process.env.STAGE || process.env.NODE_ENV || "dev").toLowerCase();

require("events").defaultMaxListeners = 50;

if (stage == "dev") require("dotenv").config();

Application.configure({
	rootDir: process.cwd(),
	modules_path: process.cwd() + "/modules",
	config_path: process.cwd() + "/config",
	stage: stage,
	logLevelConsole: stage == "dev" ? "debug" : "info",
	logLevelFile: stage == "dev" ? "info" : "info",
	logLevelRemote: stage == "dev" ? "debug" : "info",
	logformat: "DD.MM.YYYY HH:mm:ss",
	logDir: process.cwd() + "/logs",
	stages: [
		"prod",
		"dev"
	]
});

Application.run();

process.on("SIGINT", () => Application.stop());
process.on("SIGTERM", () => Application.stop());
process.on("exit", () => Application.stop());

process.on("unhandledRejection", (e) => {
	console.error(e);
});
process.on("uncaughtException", (e, ee) => {
	console.error(ee);
	console.error(e);
});
