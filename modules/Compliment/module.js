"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
const fetch = require("node-fetch");
var config;

module.exports = class Compliment extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            config = this.config;

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

                if (msg.isMemberMentioned(Application.getClient().user)) {
                    if (Tools.msg_starts_mentioned(msg,'compliment me')) {
                        if (Application.modules.DevCommands.auth_dev(msg.author.id)) {
                            return this.compliment_dev(msg)
                        } else {
                            return this.compliment(msg);
                        }
                    }
                }

            });

            return resolve(this);
        });
    }

    compliment(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.complimentType, true, 'individual')) {
            this.getCompliment().then(function (out) {
                msg.channel.send(Tools.parseReply(config.ans_compliment_template, [msg.author, out["compliment"]]));
            });
            Application.modules.Discord.setMessageSent();
        }
    }

    getCompliment() {
        return fetch('https://complimentr.com/api').then(res => res.json()).catch(err => console.error(err));
    }

    compliment_dev(msg) {
        msg.channel.send(Tools.parseReply(this.config.ans_compliment_dev, [msg.author])).then(function (res) {
            setTimeout(() => {
                let random = Tools.getRandomIntFromInterval(0, config.ans_compliment_dev_final.length - 1);
                msg.channel.send(Tools.parseReply(config.ans_compliment_dev_final[random], [msg.author]))
            }, config.complimentDevTimeout);
        });
        Application.modules.Discord.setMessageSent();
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
