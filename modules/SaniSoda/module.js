"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class SaniSoda extends Module {
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

                this.guild = Tools.guild_by_id(Application.getClient(), process.env.MAIN_SERVER);
                this.SaniSoda = this.guild.members.find(async function(user) {
                    return await Application.modules.SaniSoda.config.SaniSodaId == user
                });

                if (msg.isMemberMentioned(Application.modules.Discord.client.user)) {
                    if (Tools.msg_contains(msg, 'sick')) {
                        return this.sick(msg);
                    }

                    if (Tools.msg_contains(msg, 'injured')) {
                        return this.injured(msg);
                    }

                    if (Tools.msg_contains(msg, 'hurt')) {
                        return this.hurt(msg);
                    }

                    if (Tools.msg_contains(msg, 'sad')) {
                        return this.sad(msg);
                    }
                }
            });

            return resolve(this);
        });
    }

    sick(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.sickType)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.sickAnswer.length - 1);
            msg.channel.send(Tools.parseReply(this.config.sickAnswer[random], [msg.author, this.SaniSoda]));

            Application.modules.Discord.setMessageSent();
        }
    }

    injured(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.injuredType)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.injuredAnswer.length - 1);
            msg.channel.send(Tools.parseReply(this.config.injuredAnswer[random], [msg.author, this.SaniSoda]));

            Application.modules.Discord.setMessageSent();
        }
    }

    hurt(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.hurtType)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.hurtAnswer.length - 1);
            msg.channel.send(Tools.parseReply(this.config.hurtAnswer[random], [msg.author, this.SaniSoda]));

            Application.modules.Discord.setMessageSent();
        }
    }

    sad(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.sadType)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.sadAnswer.length - 1);
            msg.channel.send(Tools.parseReply(this.config.sadAnswer[random], [msg.author, this.SaniSoda]));

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
