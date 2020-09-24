'use strict';

// @IMPORTS
const Application = require('../../lib/Application');
const Module = require('../../lib/Module');
const Promise = require('bluebird');
const Tools = require('../../lib/Tools');
let target;
let inactive = true;
let interval;

module.exports = class RoutineMessages extends Module {
    start() {
        return new Promise(resolve => {
            this.log.debug('Starting...');

            if (Tools.test_ENV('GENERAL_CHAT')) {
                target = Application.getClient().channels.fetch(process.env.GENERAL_CHAT);
            }

            interval = this.config.m_time_imterval;

            Application.modules.Discord.client.on('message', (msg) => {
                if (Application.modules.Discord.checkUserAccess(msg.author) && inactive && target) {
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
        const now = new Date();
        return now.hour > interval[0] && now.hour < interval[1];
    }

    specificTimer(time) {
        const hour = time[0];
        const minute = time[1];
        const now = new Date();
        let millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0) - now;
        if (millisTill10 < 0) {
            millisTill10 += 86400000;
        }

        setTimeout(function() {
            if (Tools.getRandomIntFromInterval(0, 100) <= 10) {
                this.sendMaintenance();
            }
        }.bind(this), millisTill10);

        let millis = new Date(now.getFullYear(), now.getMonth(), now.getDate(), interval[1], 5, 0, 0) - now;
        if (millis < 0) {
            millis += 86400000;
        }

        if (millis > 0) {
            setTimeout(function() {
                inactive = true;
            }, millis);
        }
    }

    startMaintenance() {
        const hour = Tools.getRandomIntFromInterval(interval[0], interval[1]);
        const minute = Tools.getRandomIntFromInterval(0, 60);
        this.specificTimer([hour, minute]);
    }

    sendMaintenance() {
        const random = Tools.getRandomIntFromInterval(0, this.config.ans_m.length - 1);
        this.processMaintenance(this.config.ans_m[random]);
    }

    processMaintenance(data) {
        if (Array.isArray(data)) {
            Tools.listSender(target, data, 15000);
        }
        else {
            target.send(data);
        }
    }
};
