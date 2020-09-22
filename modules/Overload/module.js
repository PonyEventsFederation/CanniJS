'use strict';

// @IMPORTS
const Application = require('../../lib/Application');
const Module = require('../../lib/Module');
const Promise = require('bluebird');
const Tools = require('../../lib/Tools');

let total_overload = 0;
let overload = {};
let types = [];
let total_delay = 0;
let type_delay = 0;
let overload_on = false;

module.exports = class Overload extends Module {
    start() {
        return new Promise(resolve => {
            this.log.debug('Starting...');

            this.overload = function(type, num = 1) {
                return Overload.add_to_overload(type, num);
                // use Application.modules.Overload.overload('type');
            };

            types = this.config.types;
            this.load_overloader();

            Application.modules.Discord.client.on('message', (msg) => {
                if(Application.modules.Discord.checkUserAccess(msg.author) && this.check_overload(msg)) {
                    Application.modules.Discord.setMessageSent();
                    return;
                }
            });

            return resolve(this);
        });
    }

    check_overload(msg) {
        if (overload_on) {
            return true;
        }
        else if (this.check_total(this.config.total_limit) || this.check_types(this.config.type_limit)) {
            this.activate_overload(msg);
            return true;
        }
    }

    check_total(limit) {
        return total_overload >= limit;
    }

    check_types(limit) {
        let cond = false;
        types.forEach(type => {
            if (overload[type] >= limit) {
                cond = true;
            }
        });
        return cond;
    }

    load_overloader() {
        types.forEach(type => {
            overload[type] = 0;
        });

        type_delay = this.config.type_delay;
        total_delay = this.config.total_delay;
    }

    activate_overload(msg) {
        overload_on = true;
        const downtime_ms = this.config.downtime * 60000;
        const online = this.config.ans_online_again;
        const answer = this.config.ans_overload;
        this.reset_all();
        Application.getClient().user.setStatus('idle');
        Tools.listSender(msg.channel, answer, [2000, 4000, 4000], [this.config.downtime]).then(function() {
            Application.getClient().user.setStatus('dnd');
            setTimeout(function() {
                Application.getClient().user.setPresence({ status: 'online' });
                overload_on = false;
                msg.channel.send(Tools.parseReply(online));
            }, downtime_ms);
        });
    }

    static add_to_overload(type, num = 1) {
        if (overload[type] || overload[type] === 0) {
            overload[type] += num;
            setTimeout(function() {
                overload[type] -= num;
            }, type_delay);
        }
        total_overload += num;
        setTimeout(function() {
            total_overload -= num;
        }, total_delay);
    }

    reset_all() {
        total_overload = 0;
        overload = {};
        this.load_overloader();
    }

    stop() {
        return new Promise(resolve => {
            this.log.debug('Stopping...');
            return resolve(this);
        });
    }
};
