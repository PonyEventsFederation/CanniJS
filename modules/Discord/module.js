'use strict';

// @IMPORTS
const Application = require('../../lib/Application');
const Module = require('../../lib/Module');
const Promise = require('bluebird');
const DiscordJS = require('discord.js');
const Tools = require('../../lib/Tools');

module.exports = class Discord extends Module {
    init() {
        return new Promise(resolve => {
            this.log.debug('Initializing...');

            this.commands = [];
            this.reactions = [];
            this.channelMessaged = new Set();
            this.talkedRecently = new Set();
            this.userBlocked = new Set();
            this.messageSent = false;

            this.client = new DiscordJS.Client();
            this.client.on('ready', () => {
                this.log.info('Discord Bot is ready to rock!');
            });

            this.client.on('message', (msg) => {
                this.messageSent = false;
                return this.processMessage(msg);
            });

            // // process message again when its updated
            // // disabled cause it caused more problems than it was worth
            // this.client.on('messageUpdate', (_, newmsg) => {
            //     this.client.emit('message', newmsg);
            // });

            this.authToken = this.config.token;
            if (this.authToken.toLowerCase() === 'env') {
                this.authToken = process.env.BOT_TOKEN;
            }

            return resolve(this);
        });
    }

    start() {
        return new Promise(resolve => {
            this.log.debug('Starting...');

            return this.client.login(this.authToken).then(() => {
                this.firstActivity();
                return resolve(this);
            }, err => {
                this.log.error(err);
                return resolve(this);
            });
        });
    }

    stop() {
        return new Promise(resolve => {
            this.log.debug('Stopping...');

            this.client.destroy();

            return resolve(this);
        });
    }

    processMessage(msg) {
        // No bots allowed
        if (msg.author.bot) {
            return;
        }

        this.log.info('Received message ' + msg.content);
        // first we process the commands
        for (let i = 0; i < this.commands.length; i++) {
            const command = this.commands[i];
            if ((msg.mentions.has(this.client.user) && msg.content.toLowerCase().includes(command.cmd)) || msg.content.toLowerCase().startsWith('!' + command.cmd)) {
                return command.cb(msg);
            }
        }
    }

    isReady() {
        return this.client.status === DiscordJS.Constants.Status.READY;
    }

    addCommand(cmd, cb) {
        this.commands.push({ cmd, cb });
    }

    addReaction(text, type, cb) {
        this.reactions.push({ text, type, cb });
    }

    getEmoji(type) {
        const targetEmoji = this.client.emojis.cache.find(emoji => emoji.name.toLowerCase() === type.toLowerCase());

        if (targetEmoji) {
            return targetEmoji;
        }

        Application.log.error(`Emoji ${type} not found`);
        return '';
    }

    setCooldown(userId, type, cooldownTimeout) {
        this.talkedRecently.add(userId + type);
        setTimeout(() => {
            this.talkedRecently.delete(userId + type);
        }, cooldownTimeout);
    }

    hasCooldown(userId, type) {
        return this.talkedRecently.has(userId + type);
    }

    controlTalkedRecently(msg, type, sendMessage = true, target = 'channel', cooldownMessage = null, blockUser = false, cooldownTimeout = null) {
        let cooldownTarget;

        switch (target) {
        case 'channel':
            cooldownTarget = msg.channel.id + type;
            break;
        case 'individual':
            cooldownTarget = msg.author.id;
            break;
        case 'message':
            cooldownTarget = msg.author.id + type;
            break;
        }

        if (this.talkedRecently.has(cooldownTarget)) {
            // Set the default cooldown message if none is passed from another module.
            if (cooldownMessage == null) {
                if (Application.modules.DevCommands.auth_dev(msg.author.id)) {
                    cooldownMessage = Tools.parseReply(this.config.cooldownMessageDev, [msg.author, this.getEmoji('shy')]);
                }
                else {
                    cooldownMessage = Tools.parseReply(this.config.cooldownMessageDefault, [msg.author, this.getEmoji('error')]);
                }
            }

            if (sendMessage) {
                this.sendCooldownMessage(msg, cooldownTarget, cooldownMessage, blockUser);
            }

            return false;
        }
        else {
            this.talkedRecently.add(cooldownTarget);
            if (cooldownTimeout === null) {
                cooldownTimeout = this.config.cooldownTimeout;
            }
            setTimeout(() => {
                this.talkedRecently.delete(cooldownTarget);
            }, cooldownTimeout);

            return true;
        }
    }

    sendCooldownMessage(msg, cooldownTarget, cooldownMessage, blockUser) {
        if (blockUser) {
            this.blockUser(msg.author.id, this.config.blockUserTimeout);
        }

        if (this.channelMessaged.has(cooldownTarget)) {
            // Do nothing. We don't want to spam everyone all the time.
        }
        else {
            msg.channel.send(cooldownMessage);

            this.channelMessaged.add(cooldownTarget);
            setTimeout(() => {
                this.channelMessaged.delete(cooldownTarget);
            }, this.config.cooldownTimeout);
        }

        Application.modules.Discord.setMessageSent();
    }

    blockUser(userId, blockTimeout) {
        this.userBlocked.add(userId);
        setTimeout(() => {
            this.userBlocked.delete(userId);
        }, blockTimeout);
    }

    checkUserAccess(user) {
        return !(user.bot
            || Application.modules.Discord.isUserBlocked(user.id)
            || Application.modules.Discord.isMessageSent());
    }

    unblockUser(userId) {
        if (this.talkedRecently.has(userId)) {
            this.talkedRecently.delete(userId);
        }

        if (this.channelMessaged.has(userId)) {
            this.channelMessaged.delete(userId);
        }

        this.userBlocked.delete(userId);
    }

    isUserBlocked(userId) {
        return this.userBlocked.has(userId);
    }

    setMessageSent() {
        this.messageSent = true;
    }

    isMessageSent() {
        return this.messageSent;
    }

    firstActivity() {
        if (!this.isReady()) {
            return;
        }

        const msg = 'Internal systems fully operational';
        Application.modules.Discord.client.user.setPresence({
            status: 'online',
            afk: false,
            activity: {
                name: msg,
            },
        });
    }
};
