"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class CanniTimeToHype extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            Application.modules.Discord.addCommand('help', (msg) => {
                return this.help(msg);
            });

            return resolve(this);
        });
    }

    help(msg) {
        msg.author.send(Tools.parseReply(this.config.helpAnswer, [msg.author]));
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");

            return resolve(this);
        })
    }
}
