"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class Boop extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            this.boopCooldown = new Set();
            this.messageSent = new Set();

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

                if (Tools.msg_starts(msg,'boop')) {
                    if (msg.mentions !== null && !msg.mentions.everyone && msg.mentions.users.array().length > 0) {
                        let users = msg.mentions.users.array();

                        if (users.length > this.config.boopLimit) {
                            let cooldownMessage = Tools.parseReply(this.config.cooldownMessage, [msg.author, Application.modules.Discord.getEmoji('error')]);

                            if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.boopType)) {
                                Application.modules.Discord.setCooldown(msg.author.id, this.config.boopType, this.config.boopTimeout);
                                Application.modules.Discord.sendCooldownMessage(msg, msg.author.id + this.config.boopType, cooldownMessage, false);
                                this.log.info(`${msg.author} added to boop cooldown list.`);
                            }

                            Application.modules.Discord.setMessageSent();
                        }

                        if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.boopType)) {
                            for (let i = 0; i < users.length; i++) {
                                if (Application.checkSelf(users[i].id)) {
                                    this.selfBoop(msg);
                                    continue;
                                }

                                this.boop(msg,users[i]);
                            }
                        }
                    }
                }
            });

            return resolve(this);
        });
    }

    boop(msg, user) {
        let random = Tools.getRandomIntFromInterval(0, this.config.boopAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.boopAnswer[random], [user]));

        Application.modules.Discord.setMessageSent();
    }

    selfBoop(msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.selfBoopAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.selfBoopAnswer[random], [msg.author, Application.modules.Discord.getEmoji('shy')]));

        Application.modules.Discord.setMessageSent();
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
