'use strict';

// @IMPORTS
const Application = require('../../lib/Application');
const config = require("../../config/application/config.json");
const Database = require('../../lib/Database');
const Module = require('../../lib/Module');
const Promise = require('bluebird');
const Tools = require('../../lib/Tools');
const moment = require('moment');
const hugDeleteTimeout = 40000;

module.exports = class Hug extends Module {
    start() {
        return new Promise(resolve => {
            this.log.debug('Starting...');

            Application.modules.Discord.client.on('message', (msg) => {
                this.hugEmoji = Application.modules.Discord.getEmoji('gc_cannihug');

                if (Application.modules.Discord.checkUserAccess(msg.author)) {
                    this.handle(msg);
                }
            });

            return resolve(this);
        });
    }

    handle(msg) {
        // Politely asking for a hug from Canni.
        if (msg.mentions.has(Application.modules.Discord.client.user)) {
            if (Tools.msg_contains_list(msg, this.config.phrase_askHug)) {
                return this.hug(msg, this.config.requestHugAnswer, msg.author);
            }
        }

        if (Tools.strStartsWord(msg.content, 'hug')) {
            this.processHugs(msg);
        }

        if (Tools.strStartsWord(msg.content, 'megahug')) {
            this.processMegaHugs(msg);
        }
    }

    processHugs(msg) {
        if (!msg.mentions.everyone && msg.mentions.users.array().length > 0) {
            const users = msg.mentions.users.array();

            if (users.length > this.config.hugLimit) {
                this.setCooldown(msg);
            }

            else if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.hugType)) {
                for (let i = 0; i < users.length; i++) {
                    // Hug targeted at Canni.
                    if (Application.checkSelf(users[i].id)) {
                        this.hug(msg, this.config.botHugAnswer);
                        continue;
                    }

                    // Hugs targeted at self.
                    if (users[i].id === msg.author.id) {
                        this.hug(msg, this.config.selfHugAnswer);
                        continue;
                    }

                    this.hug(msg, this.config.hugAnswer, users[i]);
                }
            }
        }
    }

    processMegaHugs(msg) {
        const now = moment();
        const val = moment().endOf('day');
        const megaHugTimeout = val.diff(now, 'milliseconds');

        if (!msg.mentions.everyone && msg.mentions.users.array().length === 1) {
            const user = msg.mentions.users.array()[0];

            if (Application.checkSelf(user.id)) {
                return this.megaHug(msg, this.config.megaSelfHugAnswer, msg.author);
            }

            Database.getTimeout(msg.author.id, 'megahug').then((results) => {
                if (results.length == 0) {
                    Database.setTimeout(msg.author.id, 'megahug');
                    return this.megaHug(msg, this.config.megaHugAnswer, user);
                }
                else {
                    const cooldownMessage = Tools.parseReply(this.config.cooldownMessageMegaHug, [msg.author]);
                    msg.channel.send(cooldownMessage);
                }
            }).catch((err) => {
                this.log.error('Promise rejection error: ' + err);
            });

            Application.modules.Discord.setMessageSent();
        }
    }

    megaHug(msg, answerType, target = '') {
        const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
        const answer = Tools.parseReply(answerType[random], [target, this.hugEmoji]);

        msg.channel.send(answer);

        Application.modules.Overload.overload('hug');
        Application.modules.Discord.setMessageSent();
    }

    hug(msg, answerType, target = '') {
        const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
        const answer = Tools.parseReply(answerType[random], [target, msg.author, this.hugEmoji]);

        msg.channel.send(answer).then(message => {
            message.delete({ timeout: hugDeleteTimeout });
        });

        setTimeout(() => msg.delete(), config.deleteDelay);
        Application.modules.Overload.overload('hug');
        Application.modules.Discord.setMessageSent();
    }

    setCooldown(msg) {
        const cooldownMessage = Tools.parseReply(this.config.cooldownMessage, [msg.author, Application.modules.Discord.getEmoji('gc_cannierror')]);

        if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.bapType)) {
            Application.modules.Discord.setCooldown(msg.author.id, this.config.bapType, this.config.bapTimeout);
            Application.modules.Discord.sendCooldownMessage(msg, msg.author.id + this.config.bapType, cooldownMessage, false);
            this.log.info(`${msg.author} added to bap cooldown list.`);
        }

        Application.modules.Discord.setMessageSent();
    }

    stop() {
        return new Promise(resolve => {
            this.log.debug('Stopping...');
            return resolve(this);
        });
    }
};
