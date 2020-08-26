"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class Fanta extends Module {
    start() {
        return new Promise(resolve => {
            this.log.debug("Starting...");

            Application.modules.Discord.client.on("message", (msg) => {
                if (msg.author.bot) {
                    return;
                }

                if (Application.modules.Discord.isUserBlocked(msg.author.id)) {
                    return;
                }

                if (Application.modules.Discord.isMessageSent()) {
                    return;
                }

                if (Tools.strContainsWord(msg.content, "fanta") && !Tools.msg_contains(msg, "is best pony")) {
                    return this.fanta(msg);
                }
            });

            return resolve(this);
        });
    }

    fanta(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.fantaType)) {
            const random = Tools.getRandomIntFromInterval(0, this.config.fantaAnswers.length - 1);
            msg.channel.send(Tools.parseReply(this.config.fantaAnswers[random]));

            Application.modules.Discord.setMessageSent();
        }
    }

    stop() {
        return new Promise(resolve => {
            this.log.debug("Stopping...");
            return resolve(this);
        });
    }
};
