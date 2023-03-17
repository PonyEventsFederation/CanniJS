import Application from "./lib/Application.js";
import events from "events";
import path from "path";
import url from "url";

const stage = (process.env["STAGE"] || process.env["NODE_ENV"] || "dev").toLowerCase();

events.defaultMaxListeners = 50;

if (stage == "dev") await import("dotenv").then(d => d.config());

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
Application.configure({
	rootDir: __dirname,
	modules_path: __dirname + "/modules",
	config_path: __dirname + "/config",
	stage,
	logLevelConsole: stage == "dev" ? "debug" : "info",
	logLevelFile: stage == "dev" ? "info" : "info",
	logLevelRemote: stage == "dev" ? "debug" : "info",
	logformat: "DD.MM.YYYY HH:mm:ss",
	logDir: __dirname + "/logs",
	stages: [
		"prod",
		"dev"
	]
});

// resources

const modules = [
	"Activity",
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
const disabledModules = process.env["DISABLED_MODULES"] ? process.env["DISABLED_MODULES"].split(",").map(m => m.trim()) : [];
disabledModules.forEach(module => {
	const i = modules.indexOf(module);
	i !== -1 && modules.splice(i, 1);
});

// add all enabled modules
const enabledModules = process.env["ENABLED_MODULES"] ? process.env["ENABLED_MODULES"].split(",").map(m => m.trim()) : [];
enabledModules.forEach(module => !modules.includes(module) && modules.push(module));

modules.forEach(module => Application.registerModule(module));

Application.run();

process.on("SIGINT", () => Application.stop());
process.on("SIGTERM", () => Application.stop());
process.on("exit", () => Application.stop());
