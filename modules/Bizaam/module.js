"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class Bizaam extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            this.bizaamEmoji = Application.modules.Discord.getEmoji('bizaam');

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

                if (Tools.msg_contains(msg,'bizaam') && !Tools.msg_contains(msg,'is best pony')) {
                    return this.bizaam(msg);
                }
            });

            return resolve(this);
        });
    }

    bizaam(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.bizaamType)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.bizaamAnswer.length - 1);
            msg.channel.send(Tools.parseReply(this.config.bizaamAnswer[random], [this.bizaamEmoji])).then(sentEmbed => {
                sentEmbed.react(this.bizaamEmoji)
            });

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
