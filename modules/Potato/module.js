'use strict';

// @IMPORTS
const Application = require('../../lib/Application');
const Module = require('../../lib/Module');
const Promise = require('bluebird');
const Tools = require('../../lib/Tools');

module.exports = class Potato extends Module {
    start() {
        return new Promise(resolve => {
            this.log.debug('Starting...');

            Application.modules.Discord.client.on('message', (msg) => {
                this.smartato_emo = Tools.getEmoji(Application.getClient(), 'smartato');

                if (Application.modules.Discord.checkUserAccess(msg.author)) {
                    this.handle(msg);
                }
            });

            return resolve(this);
        });
    }

    handle(msg) {
        if (Tools.msg_contains_list(msg, this.config.phrase_potato)) {
            return this.potato(msg, this.config.potatoType, this.config.ans_potato);
        }
        else if (Tools.msg_contains_list(msg, this.config.phrase_best_potato)) {
            return this.potato(msg, this.config.bestpotatoType, this.config.ans_best_potato);
        }
        else if (Tools.msg_contains_list(msg, ['potato', 'smartato', '🥔', '🍠'])) {
            return this.potatofy(msg);
        }
    }

    potato(msg, type, answerType) {
        if (Application.modules.Discord.controlTalkedRecently(msg, type)) {
            const random = Tools.getRandomIntFromInterval(0, answerType.length - 1);
            msg.channel.send(Tools.parseReply(answerType[random], [msg.author])).then(sentEmbed => {
                this.potatofy(sentEmbed);
            });
            Application.modules.Discord.setMessageSent();
        }
    }

    potatofy(msg) {
        if (Application.modules.Discord.checkUserAccess(msg.author)) {
            msg.react(this.smartato_emo);
        }
    }

    stop() {
        return new Promise(resolve => {
            this.log.debug('Stopping...');
            return resolve(this);
        });
    }
};
