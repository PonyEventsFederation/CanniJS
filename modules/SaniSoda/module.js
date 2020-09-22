'use strict';

// @IMPORTS
const Application = require('../../lib/Application');
const Module = require('../../lib/Module');
const Promise = require('bluebird');
const Tools = require('../../lib/Tools');

module.exports = class SaniSoda extends Module {
    async start() {
        this.log.debug('Starting...');

        try {
            // @todo: Replace saniSodaId in SaniSoda.json with new SaniSoda bot.
            this.SaniSoda = await Application.getUser(this.config.saniSodaId);
            this.log.info(`Fetched user with username: ${this.SaniSoda.username}`);
        }
        catch(exception) {
            this.log.error(`Could not fetch user with ID: ${this.config.saniSodaId}`);
            return;
        }

        Application.modules.Discord.client.on('message', (msg) => {
            if (Application.modules.Discord.checkUserAccess(msg.author) && msg.mentions.has(Application.modules.Discord.client.user)) {
                this.handle(msg);
            }
        });

        return this;
    }

    handle(msg) {
        if (Tools.msg_contains(msg, 'sick')) {
            return this.sendMessage(msg, this.config.sickType, this.config.sickAnswer);
        }

        if (Tools.msg_contains(msg, 'injured')) {
            return this.sendMessage(msg, this.config.injuredType, this.config.injuredAnswe);
        }

        if (Tools.msg_contains(msg, 'hurt')) {
            return this.sendMessage(msg, this.config.hurtType, this.config.hurtAnswer);
        }

        if (Tools.msg_contains(msg, 'sad')) {
            return this.sendMessage(msg, this.config.sadType, this.config.sadAnswer);
        }

        if (Tools.msg_contains(msg, 'happy')) {
            return this.sendMessage(msg, this.config.happyType, this.config.happyAnswer);
        }
    }

    sendMessage(msg, type, answerType) {
        if (Application.modules.Discord.controlTalkedRecently(msg, type)) {
            const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
            msg.channel.send(Tools.parseReply(answerType[random], [msg.author, this.SaniSoda]));

            Application.modules.Discord.setMessageSent();
        }
    }

    stop() {
        return new Promise(resolve => {
            this.log.debug('Stopping...');
            return resolve(this);
        });
    }
};
