'use strict';

// @IMPORTS
const Application = require('../../lib/Application');
const Module = require('../../lib/Module');
const Promise = require('bluebird');
const Tools = require('../../lib/Tools');
const moment = require('moment-timezone');
const path = Application.config.rootDir + '/data/impact.gif';
let boop_dev_on = true;
let wachmann_id;
const boopDeleteTimeout = 40000;

module.exports = class Boop extends Module {
    start() {
        return new Promise(resolve => {
            this.log.debug('Starting...');

            this.boopCooldown = new Set();
            this.messageSent = new Set();
            this.interrupt = { inter: false };
            this.megaon = false;

            if (Tools.test_ENV('WACHMANN_ID')) {
                wachmann_id = process.env.WACHMANN_ID;
            }

            Application.modules.Discord.client.on('message', (msg) => {
                if (Application.modules.Discord.checkUserAccess(msg.author)) {
                    this.handle(msg);
                }
            });

            return resolve(this);
        });
    }

    handle(msg) {
        if (Tools.strStartsWord(msg.content, 'boop') && !msg.mentions.everyone && msg.mentions.users.array().length > 0) {
            const users = msg.mentions.users.array();

            if (users.length > this.config.boopLimit) {
                this.setCooldown(msg);
            }

            if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.boopType)) {
                this.processBoops(msg, users);
            }
        }

        if (this.megaon) {
            this.processBlocks(msg);
        }
        else if (boop_dev_on) {
            this.processMegaboops(msg);
            this.processUltraBoops(msg);
        }
    }

    processBoops(msg, users) {
        for (let i = 0; i < users.length; i++) {
            if (Application.checkSelf(users[i].id)) {
                this.selfBoop(msg);
                continue;
            }

            if (wachmann_id === users[i].id) {
                this.wachmannBoop(msg, users[i]);
                continue;
            }

            this.boop(msg, users[i]);
        }
    }

    processBlocks(msg) {
        if (Application.modules.DevCommands.auth_dev(msg.author.id)) {
            if (Tools.strStartsWord(msg.content, 'devblock')) {
                return this.counter(msg, 'DevBlock');
            }
            else if (Tools.strStartsWord(msg.content, 'devcounter')) {
                return this.counter(msg, 'DevCounter');
            }
        }

        if (Tools.strStartsWord(msg.content, 'block')) {
            const now = moment().tz('Europe/Berlin');
            let val = moment().tz('Europe/Berlin');
            val = val.endOf('day');

            const blockTimeout = val.diff(now, 'milliseconds');
            if (Application.modules.Discord.controlTalkedRecently(msg, this.config.megaBoopType, false, 'message', undefined, undefined, blockTimeout)) {
                return this.counter(msg, 'Block');
            }
        }
    }

    processMegaboops(msg) {
        if (Tools.strStartsWord(msg.content, 'megaboop')) {
            // Calculates the difference between now and midnight in milliseconds.
            // Only one megaboop is allowed per day.
            const now = moment().tz('Europe/Berlin');
            let val = moment().tz('Europe/Berlin');
            val = val.endOf('day');

            const megaBoopTimeout = val.diff(now, 'milliseconds');
            if (!msg.mentions.everyone && msg.mentions.users.array().length === 1) {
                const user = msg.mentions.users.array()[0];
                if (Application.checkSelf(user.id)) {
                    return this.megaSelfBoop(msg);
                }

                const cooldownMessage = Tools.parseReply(this.config.cooldownMessageMegaBoop, [msg.author]);

                if (Application.modules.Discord.controlTalkedRecently(msg, this.config.megaBoopType, true, 'individual', cooldownMessage, false, megaBoopTimeout)) {
                    return this.megaBoopLoader(msg, user);
                }
            }
        }
    }

    processUltraBoops(msg) {
        if (Tools.msg_starts(msg, 'master chief dev ultra boop') ||
        Tools.msg_starts(msg, 'master chief dev ultraboop') ||
        Tools.msg_starts(msg, 'ultraboop')) {
            if (Application.modules.DevCommands.auth_dev_master(msg.author.id) && !msg.mentions.everyone && msg.mentions.users.array().length === 1) {
                const user = msg.mentions.users.array()[0];

                if (Application.checkSelf(user.id)) {
                    return this.selfDevBoop(msg);
                }

                return this.devboop(msg, user);
            }
            else {
                return this.devbooprejection(msg);
            }
        }
    }

    boop(msg, user) {
        msg.delete();
        const random = Tools.getRandomIntFromInterval(0, this.config.boopAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.boopAnswer[random], [user])).then(message => {
            message.delete({ timeout: boopDeleteTimeout });
        });

        Application.modules.Overload.overload('boop');
        Application.modules.Discord.setMessageSent();
    }

    selfBoop(msg) {
        if (Tools.chancePercent(5)) {
            const random = Tools.getRandomIntFromInterval(0, this.config.selfBoopAnswer.length - 1);
            const answer = Tools.parseReply(this.config.selfBoopAnswer[random], [Application.modules.Discord.getEmoji('excited')]);
            msg.channel.send(answer).then(message => {
                message.delete({ timeout: boopDeleteTimeout });
            });
        }
        else {
            const random = Tools.getRandomIntFromInterval(0, this.config.canniBoopAnswer.length - 1);
            const answer = Tools.parseReply(this.config.canniBoopAnswer[random], [msg.author, Application.modules.Discord.getEmoji('shy')]);
            msg.channel.send(answer).then(message => {
                message.delete({ timeout: boopDeleteTimeout });
            });
        }

        msg.delete();

        Application.modules.Overload.overload('boop');
        Application.modules.Discord.setMessageSent();
    }

    wachmannBoop(msg, user) {
        const guard_cooldown_message = Tools.parseReply(this.config.ans_boop_guard_cooldown);
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.boop_guard_type, true, 'channel', guard_cooldown_message, undefined, 120000)) {
            this.boop(msg, user);
        }
    }

    megaBoopLoader(msg, user) {
        const roll = Tools.getRandomIntFromInterval(0, 100);

        if (roll === 100) {
            this.hyperBoop(msg, user);
        }
        else if (roll >= 0 && roll <= 5) {
            this.megaBoop(msg, user, 'miss');
        }
        else if (roll >= 90 && roll <= 99) {
            this.megaBoop(msg, user, 'crit');
        }
        else {
            this.megaBoop(msg, user);
        }
    }

    megaBoop(msg, user, type = 'hit') {
        let random, damage, answer = '', limit;
        this.interrupt.inter = false;
        switch (type) {
        case 'miss':
            random = Tools.getRandomIntFromInterval(0, this.config.megaBoopAnswer.length - 1);
            answer = this.config.megaBoopMissAnswer[random];
            limit = 20;
            break;
        case 'crit':
            random = Tools.getRandomIntFromInterval(0, this.config.megaBoopAnswer.length - 1);
            damage = Tools.getRandomIntFromInterval(13500, 18000);
            answer = this.config.megaBoopCritAnswer[random];
            limit = 90;
            break;
        default:
            random = Tools.getRandomIntFromInterval(0, this.config.megaBoopAnswer.length - 1);
            damage = Tools.getRandomIntFromInterval(9000, 12000);
            answer = this.config.megaBoopAnswer[random];
            limit = 60;
            break;
        }

        answer = this.statusgenerator(answer, limit, type === 'miss');

        let init_delay = 1000;
        let delay = 3000;

        if (Application.modules.DevCommands.auth_dev(msg.author.id)) {
            init_delay += 1000;
            delay += 2000;
        }

        this.counterWindow(delay + init_delay);
        setTimeout(function() {
            if (Array.isArray(answer)) {
                Tools.listSender(msg.channel, answer, [delay, 2000, 1000], [user, damage], this.interrupt);
            }
            else {
                msg.channel.send(Tools.parseReply(answer, [user, damage]));
            }
        }.bind(this), init_delay);

        Application.modules.Discord.setMessageSent();
    }

    megaSelfBoop(msg) {
        const random = Tools.getRandomIntFromInterval(0, this.config.megaSelfBoopAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.megaSelfBoopAnswer[random], [msg.author, Application.modules.Discord.getEmoji('hello')]));

        Application.modules.Overload.overload('boop');
        Application.modules.Discord.setMessageSent();
    }

    hyperBoop(msg, user) {
        const random = Tools.getRandomIntFromInterval(0, this.config.hyperBoopAnswer.length - 1);
        const ans = this.config.hyperBoopAnswer[random];
        if (Array.isArray(ans)) {
            Tools.listSender(msg.channel, ans, [1000, 2000, 4000, 4000, 2000, 2000, 2000, 2000, 3000], [user]);
        }
        else {
            msg.channel.send(Tools.parseReply(ans, [user]));
        }

        Application.modules.Discord.setMessageSent();
    }

    devbooprejection(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.dev_ultra_boop_rejection_type, false, 'message')) {
            const random = Tools.getRandomIntFromInterval(0, this.config.dev_ultra_boop_rejection.length - 1);
            msg.channel.send(Tools.parseReply(this.config.dev_ultra_boop_rejection[random], [msg.author]));
        }

        Application.modules.Discord.setMessageSent();
    }

    selfDevBoop(msg) {
        const random = Tools.getRandomIntFromInterval(0, this.config.dev_self_boop.length - 1);
        msg.channel.send(Tools.parseReply(this.config.dev_self_boop[random], [msg.author]));

        Application.modules.Discord.setMessageSent();
    }

    devboop(msg, user) {
        boop_dev_on = false;
        const random = Tools.getRandomIntFromInterval(0, this.config.dev_ultra_boop.length - 1);
        const ans = this.config.dev_ultra_boop[random];
        const delay = [2000, 3000, 3000, 3000, 3000, 15000, 15000, 15000, 13000, 2000, 3000, 3000, 3000, 5000];
        const delay2 = 2000;
        const config = this.config;
        if (Array.isArray(ans)) {
            Tools.listSender(msg.channel, ans, delay, [user]).then(() => {
                setTimeout(function() {
                    msg.channel.send(Tools.parseReply(config.dev_ultra_boop_impact, [user]), { files:[path] }).then(function() {
                        boop_dev_on = true;
                        msg.channel.send(Tools.parseReply(config.dev_ultra_boop_postimpact));
                    });
                }, delay2);
            });

        }
        else {
            msg.channel.send(Tools.parseReply(ans, [user]));
        }

        Application.modules.Discord.setMessageSent();
    }


    counter(msg, type_pre) {
        this.interrupt.inter = true;
        let ans;
        let type;
        if (type_pre === 'Block') {
            ans = this.config.megaBoopBlock;
            ans = this.statusgenerator(ans, 35);
            type = Tools.getRandomIntFromInterval(2000, 5000);
        }
        else {
            ans = this.config.megaBoopDevBlock;
            type = type_pre;
        }
        setTimeout(function() {
            Tools.listSender(msg.channel, ans, [2000], [msg.author, type]);
        }.bind(this), 2000);
        Application.modules.Discord.setMessageSent();
    }

    counterWindow(time) {
        this.megaon = true;
        setTimeout(function() {
            this.megaon = false;
        }.bind(this), time);
    }

    statusgenerator(ans, limit, miss = false) {
        let res = [];

        if (Tools.chancePercent(limit)) {
            const template = miss ? this.config.status_effect_miss_template : this.config.status_effect_template;
            const random = Tools.getRandomIntFromInterval(0, this.config.status_effects.length - 1);
            const effect = this.config.status_effects[random];
            const add = Tools.parseReply(template, [effect]);

            let i;
            let len;
            for(i = 0, len = ans.length; i < len; ++i) {
                res[i] = ans[i];
            }
            res[i] = add;
        }
        else {
            res = ans;
        }

        return res;
    }

    setCooldown(msg) {
        const cooldownMessage = Tools.parseReply(this.config.cooldownMessage, [msg.author, Application.modules.Discord.getEmoji('error')]);

        if (!Application.modules.Discord.hasCooldown(msg.author.id, this.config.boopType)) {
            Application.modules.Discord.setCooldown(msg.author.id, this.config.boopType, this.config.boopTimeout);
            Application.modules.Discord.sendCooldownMessage(msg, msg.author.id + this.config.boopType, cooldownMessage, false);
            this.log.info(`${msg.author} added to boop cooldown list.`);
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
