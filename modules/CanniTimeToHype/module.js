'use strict';

// @IMPORTS
const Application = require('../../lib/Application');
const Module = require('../../lib/Module');
const Promise = require('bluebird');
const moment = require('moment-timezone');
const Tools = require('../../lib/Tools');

// Set to false in case GalaCon is cancelled.
const active = true;

module.exports = class CanniTimeToHype extends Module {
    start() {
        return new Promise(resolve => {
            this.log.debug('Starting...');

            Application.modules.Discord.addCommand('when', (msg) => {
                this.handleWhen(msg);
            });

            Application.modules.Discord.client.on('message', (msg) => {
                this.handleMessage(msg);
            });

            Application.modules.Discord.client.on('ready', () => {
                setInterval(() => {
                    this.updateHype();
                }, (this.config.updateInterval || 10) * 1000);
            });

            this.setHypeDate();

            return resolve(this);
        });
    }

    handleWhen(msg) {
        if (Application.modules.Discord.checkUserAccess(msg.author)) {
            if (active) {
                return this.tellMeWhen(msg);
            }
            else {
                msg.channel.send('Currently not available...');
                Application.modules.Discord.setMessageSent();
            }
        }
    }

    handleMessage(msg) {
        if (Application.modules.Discord.checkUserAccess(msg.author) && msg.mentions.has(Application.modules.Discord.client.user)) {
            if (Tools.msg_contains(msg, 'when is galacon')) {
                if (active) {
                    return this.tellMeWhen(msg);
                }
                else {
                    msg.channel.send('Currently not available...');
                    Application.modules.Discord.setMessageSent();
                }
            }
        }
    }

    setHypeDate() {
        this.hypeDate = !this.config.hypeDate ? moment().tz('Europe/Berlin') : moment(this.config.hypeDate).tz('Europe/Berlin');

        // reactivated for Galacon 2021, deactivate afterwards
        this.log.info('Set hype date to ' + this.hypeDate.format());
        this.hypeInterval = setInterval(() => this.updateHype(), (this.config.updateInterval || 10) * 1000);
        this.updateHype();
    }

    tellMeWhen(msg) {
        const duration = this.getHypeDuration();
        const random = Tools.getRandomIntFromInterval(0, this.config.hypeAnswer.length - 1);

        msg.channel.send(Tools.parseReply(this.config.timeAnswer, [duration.days, duration.hrs, duration.minutes]) + '\n' + this.config.hypeAnswer[random]);

        Application.modules.Discord.setMessageSent();
    }

    updateHype() {
        const duration = this.getHypeDuration();
        const msg = `Time to Galacon: ${duration.days} days, ${duration.hrs}:${duration.minutes} left! Hype!`;

        Application.modules.Discord.client.user.setActivity(msg, {
            status: 'online',
            afk: false,
        }).then().catch(console.error);
    }

    getHypeDuration() {
        const duration = this.hypeDate.diff(moment().tz('Europe/Berlin'));

        let seconds = parseInt(duration) / 1000;
        const days = Math.floor(seconds / (3600 * 24));
        seconds -= days * 3600 * 24;
        const hrs = Tools.padTime(Math.floor(seconds / 3600));
        seconds -= hrs * 3600;
        const minutes = Tools.padTime(Math.floor(seconds / 60));
        seconds -= minutes * 60;

        return {
            days, hrs, minutes, seconds,
        };
    }

    stop() {
        return new Promise(resolve => {
            this.log.debug('Stopping...');

            clearInterval(this.hypeInterval);

            return resolve(this);
        });
    }
};
