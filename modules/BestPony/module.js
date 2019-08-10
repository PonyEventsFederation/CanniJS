"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class BestPony extends Module {
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

                if (msg.content.toLowerCase().includes(' is best pony')) {
                    return this.whoIsBestPony(msg);
                }
            })

            return resolve(this);
        });
    }

    whoIsBestPony(msg) {
        switch (msg.content.toLowerCase()) {
            case 'who is best pony':
                if (Application.modules.Discord.controlTalkedRecently(msg, this.config.bestPonyType)) {
                    msg.channel.send(Tools.parseReply(this.config.bestPonyAnswer1, [msg.author, Application.modules.Discord.getEmoji('bizaam')]));

                    Application.modules.Discord.setMessageSent();
                }
                break;
            case 'canni is best pony':
            case 'canni soda is best pony':
                if (Application.modules.Discord.controlTalkedRecently(msg, this.config.canniBestPonyType)) {
                    msg.channel.send(Tools.parseReply(this.config.bestPonyAnswer2, [msg.author]));

                    Application.modules.Discord.setMessageSent();
                }
                break;
            case 'bizaam is best pony':
                if (Application.modules.Discord.controlTalkedRecently(msg, this.config.bizaamBestPonyType)) {
                    msg.channel.send(Tools.parseReply(this.config.bestPonyAnswer3, [msg.author]));

                    Application.modules.Discord.setMessageSent();
                }
                break;
            case 'assfart is best pony':
                if (Application.modules.Discord.controlTalkedRecently(msg, this.config.assFartBestPonyType)) {
                    msg.channel.send(Tools.parseReply(this.config.bestPonyAnswer4, [msg.author]));

                    Application.modules.Discord.setMessageSent();
                }
                break;
            case 'fanta is best pony':
                if (Application.modules.Discord.controlTalkedRecently(msg, this.config.fantaBestPony)) {
                    msg.channel.send(Tools.parseReply(this.config.bestPonyAnswer5, [msg.author]));

                    Application.modules.Discord.setMessageSent();
                }
                break;
            default:
                if (Application.modules.Discord.controlTalkedRecently(msg, this.config.interjectType, false)) {
                    msg.channel.send(Tools.parseReply(this.config.bestPonyAnswerDefault, [msg.author]));

                    Application.modules.Discord.setMessageSent();
                }
        }
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
}
