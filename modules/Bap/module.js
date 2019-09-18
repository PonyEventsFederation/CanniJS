"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
const moment = require("moment");
var path;
var boop_dev_on = true;
var wachmann_id;

module.exports = class Boop extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            this.boopCooldown = new Set();
            this.messageSent = new Set();
            this.interrupt = { inter: false };
            this.megaon = false;
            path = Application.config.rootDir + "/data/impact.gif";

            if (Tools.test_ENV("WACHMANN_ID")) {
                wachmann_id = process.env.WACHMANN_ID;
            }

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

                if (Tools.msg_starts(msg, 'bap')) {
                    if (msg.mentions !== null && !msg.mentions.everyone && msg.mentions.users.array().length > 0) {
                        let users = msg.mentions.users.array();

                        if (users.length > this.config.boopLimit) {
                            let cooldownMessage = Tools.parseReply(this.config.cooldownMessage, [msg.author]);

                            if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.bapType)) {
                                Application.modules.Discord.setCooldown(msg.author.id, this.config.bapType, this.config.bapTimeout);
                                Application.modules.Discord.sendCooldownMessage(msg, msg.author.id + this.config.bapType, cooldownMessage, false);
                                this.log.info(`${msg.author} added to bap cooldown list.`);
                            }

                            Application.modules.Discord.setMessageSent();
                        }

                        if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.bapType)) {
                            for (let i = 0; i < users.length; i++) {
                                if (Application.checkSelf(users[i].id)) {
                                    this.selfBap(msg);
                                    continue;
                                }

                                if (wachmann_id === users[i].id) {
                                    this.wachmannBap(msg, users[i]);
                                    continue;
                                }

                                this.bap(msg, users[i]);
                            }
                        }
                    }
                }
            });

            return resolve(this);
        });
    }

    bap(msg, user) {
        let random = Tools.getRandomIntFromInterval(0, this.config.bapAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.bapAnswer[random], [user]));

        Application.modules.Overload.overload("bap");
        Application.modules.Discord.setMessageSent();
    }

    selfBap(msg) {
        if (Tools.chancePercent(25)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.selfBapAnswer.length - 1);
            msg.channel.send(Tools.parseReply(this.config.selfBapAnswer[random], [msg.author, Application.modules.Discord.getEmoji('error')]));
        } else {
            let random = Tools.getRandomIntFromInterval(0, this.config.canniBapAnswer.length - 1);
            msg.channel.send(Tools.parseReply(this.config.canniBapAnswer[random], [
                msg.author,
                Application.modules.Discord.getEmoji('error')
            ]));
        }

        Application.modules.Overload.overload("bap");
        Application.modules.Discord.setMessageSent();
    }

    wachmannBap(msg, user) {
        let guardCooldownMessage = Tools.parseReply(this.config.bapGuardCooldownAnswer);

        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.bapGuardType, true, 'channel', guardCooldownMessage, undefined, 120000)) {
            this.bap(msg, user);
        }
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
