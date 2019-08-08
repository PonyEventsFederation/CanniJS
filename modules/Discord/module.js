"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Discord = require('discord.js');

module.exports = class EMPTY extends Module {
    init() {
        return new Promise(async (resolve, reject) => {
            this.log.debug("Initializing...");

            this.client = new Discord.Client();
            this.client.on('ready', () => {
                this.log.info("Discord Bot is ready to rock!");
            });

            this.authToken = this.config.token;
            if (this.authToken.toLowerCase() === 'env') {
                this.authToken = process.env.BOT_TOKEN;
            }

            return resolve(this);
        });
    }

    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            return this.client.login(this.authToken).then(() => {
                return resolve(this);
            }, (err) => {
                this.log.error(err);
                return resolve(this);
            })
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");

            this.client.destroy();

            return resolve(this);
        });
    }
}
