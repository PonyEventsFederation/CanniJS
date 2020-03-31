"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class Activity extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            this.propability = 0.25;

            this.activitySelect();

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

                this.randomizerActivity();

            });

            return resolve(this);
        });
    }

    randomizerActivity() {
        if (Tools.chancePercent(this.propability,true)) {
            this.activitySelect()
        }
    }

    activitySelect() {
        if (!Application.modules.Discord.isReady()) {
            return;
        }
        let random = Tools.getRandomIntFromInterval(0, this.config.activity.length - 1);
        Application.modules.Discord.client.user.setActivity(this.config.activity[random]);
    }


    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
