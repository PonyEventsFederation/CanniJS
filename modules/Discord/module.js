"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const DiscordJS = require('discord.js');

module.exports = class Discord extends Module {
    init() {
        return new Promise(async (resolve, reject) => {
            this.log.debug("Initializing...");

            this.commands = [];
            this.reactions = [];

            this.client = new DiscordJS.Client();
            this.client.on('ready', () => {
                this.log.info("Discord Bot is ready to rock!");
            });

            this.client.on('message', (msg) => {
                return this.processMessage(msg);
            })

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

    processMessage(msg) {
        // No bots allowed
        if (msg.author.bot) {
            return;
        }

        this.log.info("Received message " + msg.content);
        // first we process the commands
        for (let i = 0; i < this.commands.length; i++) {
            const command = this.commands[i];
            if ((msg.isMemberMentioned(this.client.user) && msg.content.toLowerCase().includes(command.cmd)) || msg.content.toLowerCase().startsWith("!" + command.cmd)) {
                return command.cb(msg);
            }
        }
    }

    isReady() {
        return this.client.status === DiscordJS.Constants.Status.READY;
    }

    addCommand(cmd, cb) {
        this.commands.push({cmd, cb});
    }

    addReaction(text, type, cb) {
        this.reactions.push({text, type, cb});
    }
}
