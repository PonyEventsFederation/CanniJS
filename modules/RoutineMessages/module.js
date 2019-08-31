"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
var target;
var inactive = true;
var interval;

module.exports = class RoutineMessages extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            if (Tools.test_ENV("GENERAL_CHAT")) {
                target = Application.getClient().channels.find(x => x.id === process.env.GENERAL_CHAT);
            }

            interval = this.config.m_time_imterval;

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
                if (inactive && target) {
                    if (this.checkTime()) {
                        inactive = false;
                        this.startMaintenance();
                    }
                }
            });

            return resolve(this);
        });
    }

    checkTime() {
        let now = new Date();
        return now.hour > interval[0] && now.hour < interval[1];
    }

    specificTimer(time) {
        let hour = time[0];
        let minute = time[1];
        var now = new Date();
        var millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0) - now;
        if (millisTill10 < 0) {
            millisTill10 += 86400000;
        }

        setTimeout(function(){
            if (Tools.getRandomIntFromInterval(0,100) <= 10) {
                this.sendMaintenance();
            }
        }.bind(this), millisTill10);

        let millis = new Date(now.getFullYear(), now.getMonth(), now.getDate(), interval[1], 5, 0, 0) - now;
        if (millis < 0) {
            millis += 86400000;
        }

        if (millis > 0) {
            setTimeout(function(){
                inactive = true;
            }, millis);
        }
    }

    startMaintenance() {
        let hour = Tools.getRandomIntFromInterval(interval[0], interval[1]);
        let minute = Tools.getRandomIntFromInterval(0, 60);
        this.specificTimer([hour,minute]);
    }

    sendMaintenance(){
        let random = Tools.getRandomIntFromInterval(0, this.config.ans_m.length - 1);
        this.processMaintenance(this.config.ans_m[random])
    }

    processMaintenance(data) {
        if (Array.isArray(data)) {
            Tools.listSender(target,data, 15000)
        } else {
            target.send(data);
        }
    }
};
