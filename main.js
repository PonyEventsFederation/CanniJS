"use strict";
// @IMPORTS
var Application = require("./lib/Application");
var stage = (process.env.STAGE || process.env.NODE_ENV || "dev").toLowerCase();

Application.configure({
    rootDir: __dirname,
    modules_path: __dirname + "/modules",
    config_path: __dirname + "/config",
    stage: stage,
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
//Application.registerModule("EMPTY");
Application.registerModule("Discord");
//Application.registerModule("Python");
Application.registerModule("Remote");
Application.registerModule("Overload");
Application.registerModule("Ignore");
Application.registerModule("Holiday");
Application.registerModule("Potato");
Application.registerModule("UserJoined");
Application.registerModule("Help");
Application.registerModule("CanniTimeToHype");
Application.registerModule("Boop");
Application.registerModule("Bap");
Application.registerModule("Hug");
Application.registerModule("Fanta");
Application.registerModule("Bizaam");
Application.registerModule("Assfart");
Application.registerModule("BestPony");
Application.registerModule("WorstPony");
Application.registerModule("MentionCanni");
Application.registerModule("DevCommands");
Application.registerModule("Solver");
Application.registerModule("GamerCanni");
Application.registerModule("Utilities");
Application.registerModule("Compliment");
Application.registerModule("Hype");
Application.registerModule("RoutineMessages");
Application.registerModule("InterBotCom");
Application.registerModule("SaniSoda");
Application.registerModule("NoMessageProcessor");


Application.run();

process.on('SIGINT', function () {
    Application.stop();
});

process.on('exit', function () {
    Application.stop();
});
