"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const moment = require("moment");
const Tools = require("../../lib/Tools");
const Data = require("../../config/BestPony.json");

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
                msg.channel.send(`${msg.author} I am, of course!`);
                break;
            case 'canni is best pony':
            case 'canni soda is best pony':
                msg.channel.send(`${msg.author} I sure am!`);
                break;
            case 'bizaam is best pony':
                msg.channel.send(`${msg.author} A bizaam isn't a pony, silly...`);
                break;
            case 'assfart is best pony':
                msg.channel.send(`${msg.author} Rude!`);
                break;
            case 'fanta is best pony':
                msg.channel.send(`${msg.author} Is this a GalaCon thing?`);
                break;
            default:
                msg.channel.send(`${msg.author} Nu-uh. I am best pony!`);
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
