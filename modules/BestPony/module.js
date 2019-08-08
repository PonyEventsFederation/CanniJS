"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const moment = require("moment");
const Tools = require("../../lib/Tools");

module.exports = class BestPony extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            console.log();

            Application.modules.Discord.client.on('message', (msg) => {
                if (msg.content.includes(' is best pony')) {
                    return this.whoIsBestPony(msg);
                }
            })

            return resolve(this);
        });
    }

    whoIsBestPony(msg) {
        switch (msg.content.toLowerCase()) {
            case 'who is best pony':
                msg.channel.send(Tools.parseReply('ans_best_pony1', [msg.author]));
                break;
            case 'canni is best pony':
            case 'canni soda is best pony':
                msg.channel.send(Tools.parseReply('ans_best_pony2', [msg.author]));
                break;
            case 'bizaam is best pony':
                msg.channel.send(Tools.parseReply('ans_best_pony3', [msg.author]));
                break;
            case 'assfart is best pony':
                msg.channel.send(Tools.parseReply('ans_best_pony4', [msg.author]));
                break;
            case 'fanta is best pony':
                msg.channel.send(Tools.parseReply('ans_best_pony5', [msg.author]));
                break;
            default:
                msg.channel.send(Tools.parseReply('ans_best_pony_default', [msg.author]));
        }
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");

            clearInterval(this.hypeInterval);

            return resolve(this);
        })
    }
}
