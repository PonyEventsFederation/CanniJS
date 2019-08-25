"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class Utilities extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");
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

                if (Tools.msg_contains_list(msg, this.config.phrase_bye_night)) {
                    return this.bye_night(msg);
                } else if (Tools.msg_contains_list(msg, this.config.phrase_bye)) {
                    return this.bye(msg);
                } else if (Tools.msg_contains_word_list(msg, this.config.phrase_hello)) {
                    return this.hello(msg);
                }
                else if (Tools.msg_contains_list(msg, this.config.phrase_hello_morning)) {
                    return this.hello_morning(msg);
                }

            });

            return resolve(this);
        });
    }

    bye_night(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.byenightType, false, 'channel', undefined, undefined, 90000)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.ans_bye_night.length - 1);
            msg.channel.send(Tools.parseReply(this.config.ans_bye_night[random]));
            Application.modules.Discord.setMessageSent();
        }
    }

    bye(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.byeType, false, 'channel', undefined, undefined, 90000)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.ans_bye.length - 1);
            msg.channel.send(Tools.parseReply(this.config.ans_bye[random]));
            Application.modules.Discord.setMessageSent();
        }
    }

    hello(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.helloType, false, 'channel', undefined, undefined, 90000)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.ans_hello.length - 1);
            msg.channel.send(Tools.parseReply(this.config.ans_hello[random]));
            Application.modules.Discord.setMessageSent();
        }
    }

    hello_morning(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.hello_morning_Type, false, 'channel', undefined, undefined, 90000)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.ans_hello_morning.length - 1);
            msg.channel.send(Tools.parseReply(this.config.ans_hello_morning[random]));
            Application.modules.Discord.setMessageSent();
        }
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
