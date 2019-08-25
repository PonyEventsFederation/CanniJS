"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

var target;
var sender = null;
var user;
var active = false;

module.exports = class Remote extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            if (Tools.test_ENV("GENERAL_CHAT")) {
                target = Application.getClient().channels.find(x => x.id === process.env.GENERAL_CHAT);
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

                if (Application.modules.DevCommands.auth_dev(msg.author.id)) {
                    if (target) {
                        if (Tools.msg_starts(msg, ">remote")) {
                            return this.remoteSwitch(msg);
                        }
                        if (Tools.msg_starts(msg, ">deactivate")) {
                            return this.remoteDeactivate(msg);
                        }
                        if (!Tools.msg_starts(msg, ">") && active) {
                            return this.remoteControl(msg);
                        }
                    } else {
                        if (Tools.msg_starts(msg, ">remote") || Tools.msg_starts(msg, ">deactivate"))
                            return this.remoteNotAvailable(msg);
                    }
                }
            });

            return resolve(this);
        });
    }

    remoteSwitch(msg) {
        if (active) {
            if (sender === msg.channel) {
                active = !active;
                sender = null;
                msg.channel.send(Tools.parseReply(this.config.ans_deactivate));
            } else {
                msg.channel.send(Tools.parseReply(this.config.ans_in_use));
            }
        } else {
            active = !active;
            user = msg.author;
            sender = msg.channel;
            msg.channel.send(Tools.parseReply(this.config.ans_activate));

        }
        Application.modules.Discord.setMessageSent();
    }

    remoteDeactivate(msg) {
        if (active) {
            active = false;
            sender = null;
            msg.channel.send(Tools.parseReply(this.config.ans_deactivate));
        } else {
            msg.channel.send(Tools.parseReply(this.config.ans_already_deactivate));
        }
        Application.modules.Discord.setMessageSent();
    }

    remoteControl(msg) {
        if (user === msg.author && sender === msg.channel) {
            let content = msg.content;
            content = Tools.emoji_parser(content, msg.client);
            target.send(Tools.parseReply(content));
            Application.modules.Discord.setMessageSent();
        }
    }

    remoteNotAvailable(msg) {
        msg.channel.send(Tools.parseReply(this.config.ans_not_availabel));
        Application.modules.Discord.setMessageSent();
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
