"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
const moment = require("moment");

module.exports = class Hug extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            this.hugEmoji = Application.modules.Discord.getEmoji('hug');

            //time in ms
            this.hugDeleteTimeout = 40000;

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
                    if (Tools.msg_contains_list(msg, this.config.phrase_askHug)) {
                        return this.requestHug(msg);
                    }
                }

                if (Tools.msg_starts(msg, 'hug')) {
                    if (msg.mentions !== null && !msg.mentions.everyone && msg.mentions.users.array().length > 0) {
                        let users = msg.mentions.users.array();

                        if (users.length > this.config.hugLimit) {
                            let cooldownMessage = Tools.parseReply(this.config.cooldownMessage, [msg.author, Application.modules.Discord.getEmoji('error')]);

                            if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.hugType)) {
                                Application.modules.Discord.setCooldown(msg.author.id, this.config.hugType, this.config.hugTimeout);
                                Application.modules.Discord.sendCooldownMessage(msg, msg.author.id + this.config.hugType, cooldownMessage, false);
                                this.log.info(`${msg.author} added to hug cooldown list.`);
                            }

                            Application.modules.Discord.setMessageSent();
                        }

                        if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.hugType)) {
                            for (let i = 0; i < users.length; i++) {
                                // Hug targeted at Canni.
                                if (Application.checkSelf(users[i].id)) {
                                    this.botHug(msg);
                                    continue;
                                }

                                // Hugs targeted at self.
                                if (users[i].id === msg.author.id) {
                                    this.selfHug(msg);
                                    continue;
                                }

                                this.hug(users[i], msg);
                            }
                        }
                    }
                }

                if (Tools.msg_starts(msg, 'megahug') || Tools.msg_starts(msg, 'mega hug')) {
                    let now = moment();
                    let val = moment().endOf('day');
                    let megaHugTimeout = val.diff(now, 'milliseconds');

                    if (msg.mentions !== null && !msg.mentions.everyone && msg.mentions.users.array().length === 1) {
                        let user = msg.mentions.users.array()[0];
                        if (Application.checkSelf(user.id)) {
                            return this.megaSelfHug(msg);
                        }

                        let cooldownMessage = Tools.parseReply(this.config.cooldownMessageMegaHug, [msg.author]);

                        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.megaHugType, true, 'message', cooldownMessage, false, megaHugTimeout)) {
                            return this.megaHug(msg, user);
                        }
                    }
                }
            });

            return resolve(this);
        });
    }

    megaSelfHug(msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.megaSelfHugAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.megaSelfHugAnswer[random], [msg.author, this.hugEmoji]));

        Application.modules.Discord.setMessageSent();
    }

    megaHug(msg, user) {
        let random = Tools.getRandomIntFromInterval(0, this.config.megaHugAnswer.length - 1);
        let answer = this.config.megaHugAnswer[random];
        if (Array.isArray(answer)) {
            Tools.listSender(msg.channel, answer, [1000], [user, this.hugEmoji]);
        } else {
            msg.channel.send(Tools.parseReply(answer, [user, this.hugEmoji]));
        }

        Application.modules.Overload.overload("hug");
        Application.modules.Discord.setMessageSent();
    }

    requestHug(msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.requestHugAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.requestHugAnswer[random], [msg.author, msg.author, this.hugEmoji]));

        Application.modules.Overload.overload("hug");
        Application.modules.Discord.setMessageSent();
    }

    botHug(msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.botHugAnswer.length - 1);
        msg.delete();
        msg.channel.send(Tools.parseReply(this.config.botHugAnswer[random], [msg.author, this.hugEmoji])).then(msg => {
            msg.delete(this.hugDeleteTimeout);
        });

        Application.modules.Overload.overload("hug");
        Application.modules.Discord.setMessageSent();

        //console.log("botHug");
    }

    selfHug(msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.selfHugAnswer.length - 1);
        msg.delete();
        msg.channel.send(Tools.parseReply(this.config.selfHugAnswer[random], [msg.author, this.hugEmoji])).then(msg => {
            msg.delete(this.hugDeleteTimeout);
        });

        Application.modules.Overload.overload("hug");
        Application.modules.Discord.setMessageSent();

        //console.log("selfHug");
    }

    hug(target, msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.hugAnswer.length - 1);
        msg.delete();
        msg.channel.send(Tools.parseReply(this.config.hugAnswer[random], [target, msg.author, this.hugEmoji])).then(msg => {
            msg.delete(this.hugDeleteTimeout);
        });

        Application.modules.Overload.overload("hug");
        Application.modules.Discord.setMessageSent();

        //console.log("hug");
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
