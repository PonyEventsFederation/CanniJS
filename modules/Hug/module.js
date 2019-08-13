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

            this.hugEmoji = Application.modules.Discord.getEmoji('hug');

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

                // Politely asking for a hug from Canni.
                if (msg.isMemberMentioned(Application.modules.Discord.client.user)) {
                    if (msg.content.toLowerCase().includes('can i have a hug')) {
                        return this.requestHug(msg);
                    }
                }

                if (msg.content.toLowerCase().startsWith('hug')) {
                    if (msg.mentions !== null && !msg.mentions.everyone && msg.mentions.users.array().length > 0) {
                        let users = msg.mentions.users.array();

                        for (let i = 0; i < users.length; i++) {
                            // Hug targeted at Canni.
                            if (users[i].id == Application.modules.Discord.client.user.id) {
                                this.botHug(msg);
                                continue;
                            }

                            // Hugs targeted at self.
                            if (users[i].id == msg.author.id) {
                                this.selfHug(msg);
                                continue;
                            }

                            this.hug(users[i], msg);
                        }
                    }
                }
            })

            return resolve(this);
        });
    }

    requestHug(msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.requestHugAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.requestHugAnswer[random], [msg.author, msg.author, this.hugEmoji]));

        Application.modules.Discord.setMessageSent();
    }

    botHug(msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.botHugAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.botHugAnswer[random], [msg.author, this.hugEmoji]));

        Application.modules.Discord.setMessageSent();
    }

    selfHug(msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.selfHugAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.selfHugAnswer[random], [msg.author, this.hugEmoji]));

        Application.modules.Discord.setMessageSent();
    }

    hug(target, msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.hugAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.hugAnswer[random], [target, msg.author, this.hugEmoji]));

        Application.modules.Discord.setMessageSent();
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
}
