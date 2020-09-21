'use strict';

// @IMPORTS
const Application = require('../../lib/Application');
const Module = require('../../lib/Module');
const Promise = require('bluebird');
const Tools = require('../../lib/Tools');
let wachmann_id;

module.exports = class Boop extends Module {
    start() {
        return new Promise(resolve => {
            this.log.debug('Starting...');

            this.boopCooldown = new Set();
            this.messageSent = new Set();
            this.interrupt = { inter: false };
            this.megaon = false;

            // time in ms
            this.bapDeleteTimeout = 40000;

            if (Tools.test_ENV('WACHMANN_ID')) {
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
                    if (!msg.mentions.everyone && msg.mentions.users.array().length > 0) {
                        const users = msg.mentions.users.array();

                        if (users.length > this.config.bapLimit) {
                            const cooldownMessage = Tools.parseReply(this.config.cooldownMessage, [msg.author]);

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

                            msg.delete();
                        }
                    }
                }
            });

            return resolve(this);
        });
    }

    bap(msg, user) {
        const random = Tools.getRandomIntFromInterval(0, this.config.bapAnswer.length - 1);

        msg.channel.send(Tools.parseReply(this.config.bapAnswer[random], [user])).then(message => {
            message.delete({ timeout: this.bapDeleteTimeout });
        });

        Application.modules.Overload.overload('bap');
        Application.modules.Discord.setMessageSent();
    }

    selfBap(msg) {
        let response;
        msg.delete();
        if (Tools.chancePercent(25)) {
            const random = Tools.getRandomIntFromInterval(0, this.config.selfBapAnswer.length - 1);
            response = msg.channel.send(Tools.parseReply(this.config.selfBapAnswer[random], [
                msg.author,
                Application.modules.Discord.getEmoji('error'),
            ]));
        }
        else {
            const random = Tools.getRandomIntFromInterval(0, this.config.canniBapAnswer.length - 1);
            response = msg.channel.send(Tools.parseReply(this.config.canniBapAnswer[random], [
                msg.author,
                Application.modules.Discord.getEmoji('error'),
            ]));
        }

        response.then(message => {
            message.delete({ timeout: this.bapDeleteTimeout });
        });

        Application.modules.Overload.overload('bap');
        Application.modules.Discord.setMessageSent();
    }

    wachmannBap(msg, user) {
        const guardCooldownMessage = Tools.parseReply(this.config.bapGuardCooldownAnswer);

        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.bapGuardType, true, 'channel', guardCooldownMessage, undefined, 120000)) {
            this.bap(msg, user);
        }
    }

    stop() {
        return new Promise(resolve => {
            this.log.debug('Stopping...');
            return resolve(this);
        });
    }
};
