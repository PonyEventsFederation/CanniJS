"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class BestPony extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            Application.modules.Discord.client.on('message', (msg) => {
                if (msg.author.bot) {
                    return;
                }

                if (Application.modules.Discord.isUserBlocked(msg.author.id)) {
                    return;
                }

                if (Application.modules.Discord.isMessageSent()) {
                    return;
                }

                if (Tools.msg_contains(msg,'assfart') && !Tools.msg_contains(msg,'is best pony')) {
                    return this.assFart(msg);
                }
            });

            return resolve(this);
        });
    }

    assFart(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.assfartType)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.assfartAnswer.length - 1);
            msg.channel.send(Tools.parseReply(this.config.assfartAnswer[random], [msg.author]));

            Application.modules.Discord.setMessageSent();
        }
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
