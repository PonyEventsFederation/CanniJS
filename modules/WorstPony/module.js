"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class WorstPony extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            Application.modules.Discord.client.on('message', (msg) => {
                if (msg.author.bot) {
                    return;
                }

                if (msg.isMemberMentioned(Application.modules.Discord.client.user)) {
                    if (Tools.msg_contains(msg,'i\'m sorry') || Tools.msg_contains(msg,'i am sorry')) {
                        return this.forgiveUser(msg);
                    }
                }

                if (Application.modules.Discord.isUserBlocked(msg.author.id)) {
                    return;
                }

                if (Application.modules.Discord.isMessageSent()) {
                    return;
                }

                if (Tools.msg_contains(msg,' is worst pony')) {
                    return this.whoIsWorstPony(msg);
                }
            });

            return resolve(this);
        });
    }

    forgiveUser(msg) {
        if (Application.modules.Discord.isUserBlocked(msg.author.id)) {
            let random = Tools.getRandomIntFromInterval(0, this.config.forgiveUserAnswer.length - 1);
            msg.channel.send(Tools.parseReply(this.config.forgiveUserAnswer[random], [msg.author, Application.modules.Discord.getEmoji('love')]));

            Application.modules.Discord.unblockUser(msg.author.id);
        } else {
            let random = Tools.getRandomIntFromInterval(0, this.config.notSorryAnswer.length - 1);
            msg.channel.send(Tools.parseReply(this.config.notSorryAnswer[random], [msg.author]));
        }

        Application.modules.Discord.setMessageSent();
    }

    whoIsWorstPony(msg) {
        switch (msg.content.toLowerCase()) {
            case 'canni is worst pony':
            case 'canni soda is worst pony':
                var cooldownMessage = Tools.parseReply(this.config.cooldownMessageWorstPony, [msg.author]);

                if (Application.modules.Discord.controlTalkedRecently(msg, this.config.canniWorstPonyType, true, 'individual', cooldownMessage, true)) {
                    let random = Tools.getRandomIntFromInterval(0, this.config.canniWorstPonyAnswer.length - 1);
                    msg.channel.send(Tools.parseReply(this.config.canniWorstPonyAnswer[random], [msg.author]));

                    Application.modules.Discord.setMessageSent();
                }
                break;
        }
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
