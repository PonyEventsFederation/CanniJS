"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const DiscordJS = require('discord.js');
const Tools = require("../../lib/Tools");

module.exports = class Discord extends Module {
    init() {
        return new Promise(async (resolve, reject) => {
            this.log.debug("Initializing...");

            this.commands = [];
            this.reactions = [];
            this.channelMessaged = new Set();
            this.talkedRecently = new Set();
            this.userBlocked = new Set();

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

    getEmoji(type) {
        var emoji = this.client.emojis.find(emoji => emoji.name.toLowerCase() === type.toLowerCase());

        if (emoji) {
            return emoji;
        }

        Application.log.error(`Emoji ${type} not found`);
        return "";
    }

    controlTalkedRecently(msg, type, sendMessage = true, target = 'channel', cooldownMessage = null) {
        switch (target) {
            case 'channel':
                var cooldownTarget = msg.channel.id + type;
                break;
            case 'individual':
                var cooldownTarget = msg.author.id;
                break;
        }

        if (this.talkedRecently.has(cooldownTarget)) {
            // Set the default cooldown message if none is passed from another module.
            if (cooldownMessage == null) {
                cooldownMessage = Tools.parseReply(this.config.cooldownMessageDefault, [msg.author, this.getEmoji('error')]);
            }

            if (sendMessage) {
                this.sendCooldownMessage(msg, cooldownTarget, cooldownMessage);
            }

            return false;
        } else {
            this.talkedRecently.add(cooldownTarget);

            setTimeout(() => {
                this.talkedRecently.delete(cooldownTarget);
            }, this.config.cooldownTimeout);

            return true;
        }
    }

    sendCooldownMessage(msg, cooldownTarget, cooldownMessage) {
        if (this.channelMessaged.has(cooldownTarget)) {
            // Do nothing. We don't want to spam everyone all the time.
        } else {
            msg.channel.send(cooldownMessage)

            this.channelMessaged.add(cooldownTarget);
            setTimeout(() => {
                this.channelMessaged.delete(cooldownTarget);
            }, this.config.cooldownTimeout);
        }
    }

    blockUser(userId, blockTimeout) {
        this.userBlocked.add(userId);
        setTimeout(() => {
            this.userBlocked.delete(userId);
        }, blockTimeout);
    }

    unblockUser(userId) {
        this.userBlocked.delete(userId);
    }

    isUserBlocked(userId) {
        return this.userBlocked.has(userId);
    }
}
