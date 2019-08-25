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

            this.hugEmoji = Application.modules.Discord.getEmoji('hug');
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
                    if (Tools.msg_starts_mentioned(msg,'compliment')) {
                        if (msg.mentions !== null && !msg.mentions.everyone && msg.mentions.users.array().length > 0) {
                            let users = msg.mentions.users.array();

                            for (let i = 0; i < users.length; i++) {
                                if (Application.checkSelf(users[i].id)) {
                                    let id = Tools.get_id_from_mention(msg.content.split(" ").filter(Boolean)[2]);
                                    if (msg.mentions.users.array().length === 1 && Application.checkSelf(id)) {
                                        this.compliment_bot(msg);
                                    }
                                    continue;
                                }
                                if (users[i].id === msg.author.id) {
                                    if (Application.modules.DevCommands.auth_dev(msg.author.id)) {
                                        this.compliment_dev(msg)
                                    } else {
                                        this.compliment_self(msg);
                                    }
                                    continue;
                                }

                                this.compliment_user(users[i], msg);
                            }
                        }
                    }
                    if (Tools.msg_starts_mentioned(msg,'compliment me')) {
                        if (Application.modules.DevCommands.auth_dev(msg.author.id)) {
                            return this.compliment_dev(msg)
                        } else {
                            return this.compliment_self(msg);
                        }
                    }
                }
            });

            return resolve(this);
        });
    }

    compliment_self(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.selfcomplimentType, true, 'message', undefined, undefined, 120000)) {
            this.getCompliment().then(function (out) {
                msg.channel.send(Tools.parseReply(config.ans_self_compliment_template, [msg.author, out["compliment"]]));
            });
            Application.modules.Discord.setMessageSent();
        }
    }

    compliment_user(user,msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.usercomplimentType, true, 'message', undefined, undefined, 120000)) {
            this.getCompliment().then(function (out) {
                msg.channel.send(Tools.parseReply(config.ans_user_compliment_template, [user, msg.author, out["compliment"]]));
            });
            Application.modules.Discord.setMessageSent();
        }
    }

    compliment_bot(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.botcomplimentType, true, 'message', undefined, undefined, 120000)) {
            msg.channel.send(Tools.parseReply(this.config.ans_bot_compliment, [msg.author, this.hugEmoji]));
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
