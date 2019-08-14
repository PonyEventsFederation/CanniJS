"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const moment = require("moment");
const Tools = require("../../lib/Tools");

module.exports = class CanniTimeToHype extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            Application.modules.Discord.addCommand('when', (msg) => {
                if (Application.modules.Discord.isUserBlocked(msg.author.id)) {
                    return;
                }

                if (Application.modules.Discord.isMessageSent()) {
                    return;
                }

                return this.tellMeWhen(msg);
            });

            Application.modules.Discord.client.on('message', (msg) => {
                if (Application.modules.Discord.isUserBlocked(msg.author.id)) {
                    return;
                }

                if (Application.modules.Discord.isMessageSent()) {
                    return;
                }

                if (msg.isMemberMentioned(Application.modules.Discord.client.user)) {
                    if (msg.content.toLowerCase().includes('when is galacon')) {
                        return this.tellMeWhen();
                    }
                }
            });

            if (!this.config.hypeDate) {
                this.hypeDate = moment();
            } else {
                this.hypeDate = moment(this.config.hypeDate);
            }

            this.log.info("Set hype date to " + this.hypeDate.format());
            this.hypeInterval = setInterval(() => this.updateHype(), (this.config.updateInterval || 10) * 1000);
            this.updateHype();

            return resolve(this);
        });
    }

    getHypeDuration() {
        const duration = this.hypeDate.diff(moment());

        let seconds = parseInt(duration) / 1000;
        const days = Math.floor(seconds / (3600 * 24));
        seconds -= days * 3600 * 24;
        const hrs = Tools.padTime(Math.floor(seconds / 3600));
        seconds -= hrs * 3600;
        const minutes = Tools.padTime(Math.floor(seconds / 60));
        seconds -= minutes * 60;

        return {
            days, hrs, minutes, seconds
        };
    }

    tellMeWhen(msg) {
        const duration = this.getHypeDuration();
        let random = Tools.getRandomIntFromInterval(0, this.config.hypeAnswer.length - 1)

        msg.channel.send(Tools.parseReply(this.config.timeAnswer, [duration.days, duration.hrs, duration.minutes]));
        msg.channel.send(this.config.hypeAnswer[random]);

        Application.modules.Discord.setMessageSent();
    }

    updateHype() {
        if (!Application.modules.Discord.isReady()) {
            return;
        }

        const duration = this.getHypeDuration();
        const msg = `Time to Galacon: ${duration.days} days, ${duration.hrs}:${duration.minutes} left! Hype!`;
        Application.modules.Discord.client.user.setActivity(msg);
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");

            clearInterval(this.hypeInterval);

            return resolve(this);
        })
    }
}
