"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class NoMessageProcessor extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            this.remote_on = false;
            this.remote_target = null;

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

                // When no message was sent, Canni either says she doesn't understand, or boops someone at random if she's not mentioned.
                if (msg.isMemberMentioned(Application.getClient().user)) {
                    if (!this.remote_on || this.remote_target !== msg.channel) {
                        msg.channel.send(Tools.parseReply(this.config.stillLearningAnswer, [Application.modules.Discord.getEmoji('shy')]));
                    }
                } else {
                    let random = Tools.getRandomIntFromInterval(0, 300);
                    if (random === 10) {
                        msg.channel.send(Tools.parseReply(this.config.randomBoopAnswer, [msg.author]));
                    }

                    if (random === 42) {
                        Application.modules.GamerCanni.letsPlay(msg, this.config.playGameAnswer);
                    }
                }
            });

            return resolve(this);
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
