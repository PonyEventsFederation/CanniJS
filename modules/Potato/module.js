"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
var smartato_emo;

module.exports = class Potato extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            smartato_emo = Tools.getEmoji(Application.getClient(),"smartato");

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

                if (Tools.msg_contains_list(msg, this.config.phrase_potato)) {
                    return this.potato(msg);
                } else if (Tools.msg_contains_list(msg, this.config.phrase_best_potato)) {
                    return this.bestpotato(msg);
                } else if (Tools.msg_contains(msg,'potato') || Tools.msg_contains(msg,'smartato')) {
                    return this.potatofy(msg);
                }
            });

            return resolve(this);
        });
    }

    bestpotato(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.bestpotatoType)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.ans_best_potato.length - 1);
            msg.channel.send(Tools.parseReply(this.config.ans_best_potato[random], [msg.author])).then(sentEmbed => {
                this.potatofy(sentEmbed);
            });
            Application.modules.Discord.setMessageSent();
        }
    }

    potato(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.potatoType)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.ans_potato.length - 1);
            msg.channel.send(Tools.parseReply(this.config.ans_potato[random], [msg.author])).then(sentEmbed => {
                this.potatofy(sentEmbed);
            });
            Application.modules.Discord.setMessageSent();
        }
    }

    potatofy(msg) {
        msg.react(smartato_emo);
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
