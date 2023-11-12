"use strict";
// @IMPORTS
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

// resources

const modules = [
	// "Activity",
	"Discord",
	"Overload",
	"Ignore",
	"Holiday",
	"Potato",
	"UserJoined",
	"Help",
	"TimeToGalacon",
	"Boop",
	"Bap",
	"Hug",
	"Fanta",
	"Bizaam",
	"Assfart",
	"BestPony",
	"WorstPony",
	"MentionCanni",
	"DevCommands",
	"Solver",
	"GamerCanni",
	"Greetings",
	"Compliment",
	"Hype",
	"RoutineMessages",
	"InterBotCom",
	"NoMessageProcessor"
];

// remove all disabled modules
const disabledModules = process.env.DISABLED_MODULES ? process.env.DISABLED_MODULES.split(",").map(m => m.trim()) : [];
disabledModules.forEach(module => {
	const i = modules.indexOf(module);
	i !== -1 && modules.splice(i, 1);
});

// add all enabled modules
const enabledModules = process.env.ENABLED_MODULES ? process.env.ENABLED_MODULES.split(",").map(m => m.trim()) : [];
enabledModules.forEach(module => !modules.includes(module) && modules.push(module));

modules.forEach(module => Application.registerModule(module));

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
