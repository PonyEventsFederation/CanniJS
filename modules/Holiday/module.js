"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

var wachmann_id;

module.exports = class Holiday extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            if (Tools.test_ENV("WACHMANN_ID")) {
                wachmann_id = process.env.WACHMANN_ID;
            }

            var christmas_date = [12, 25];
            var new_year_date = [1, 1];

            this.cannisanta = Application.modules.Discord.getEmoji('CanniSanta');
            this.silvester = Application.modules.Discord.getEmoji('Silvester');

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

                if (Tools.check_date(christmas_date, 1)) {
                    if (Tools.msg_contains(msg,'merry christmas')) {
                        return this.christmas_loader(msg);
                    }
                }

                if (Tools.check_date(new_year_date, 0)) {
                    if (Tools.msg_contains(msg,'happy new year')) {
                        return this.new_year_loader(msg);
                    }
                }
            });

            return resolve(this);
        });
    }



    christmas_loader(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.christmasType, false, "message")) {
            if (Tools.chancePercent(10)) {
                this.special_christmas(msg)
            } else {
                this.christmas(msg)
            }
        }
    }

    christmas(msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.christmasAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.christmasAnswer[random], [msg.author, this.cannisanta]));

        Application.modules.Discord.setMessageSent();
    }

    special_christmas(msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.specialchristmasAnswer.length - 1);
        let answer = this.config.specialchristmasAnswer[random];

        let wachmann_user = Tools.find_user_by_id(msg.guild, wachmann_id);
        if (wachmann_user === null) {
            this.christmas(msg);
        } else {
            if (Array.isArray(answer)) {
                Tools.listSender(msg.channel, answer, [5000], [msg.author, this.cannisanta, wachmann_user]);
            } else {
                msg.channel.send(Tools.parseReply(answer, [msg.author, this.cannisanta]));
            }
            Application.modules.Discord.setMessageSent();
        }
    }

    new_year_loader(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.silvesterType, false, "message")) {
            if (Tools.chancePercent(30)) {
                this.special_new_year(msg)
            } else {
                this.new_year(msg)
            }
        }
    }

    new_year(msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.silvesterAnswer.length - 1);
        msg.channel.send(Tools.parseReply(this.config.silvesterAnswer[random], [msg.author, this.silvester]));

        Application.modules.Discord.setMessageSent();
    }

    special_new_year(msg) {
        let random = Tools.getRandomIntFromInterval(0, this.config.specialsilvesterAnswer.length - 1);
        let answer = this.config.specialsilvesterAnswer[random];

        let wachmann_user = Tools.find_user_by_id(msg.guild, wachmann_id);
        if (wachmann_user === null) {
            this.christmas(msg);
        } else {
            if (Array.isArray(answer)) {
                Tools.listSender(msg.channel, answer, [5000], [msg.author, this.silvester, wachmann_user]);
            } else {
                msg.channel.send(Tools.parseReply(answer, [msg.author, this.silvester]));
            }
            Application.modules.Discord.setMessageSent();
        }
    }


    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
