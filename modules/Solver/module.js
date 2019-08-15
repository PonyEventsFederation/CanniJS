"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
var Algebrite = require('algebrite');

module.exports = class BestPony extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            this.smileEmoji = Application.modules.Discord.getEmoji('smile');

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

                if (msg.isMemberMentioned(Application.getClient().user)) {
                    if (Tools.msg_starts_mentioned(msg,"solve")) {
                        if (Tools.msg_starts_mentioned(msg,"solve multi")) {
                            return this.simple_multi_parse(msg);
                        } else if (Tools.msg_starts_mentioned(msg,"solver info")) {
                            return this.info(msg);
                        } else {
                            return this.simple_parse(msg);
                        }
                    }
                }
            });
            return resolve(this);
        });
    }

    info(msg) {
        msg.channel.send(Tools.parseReply(this.config.solver_info, [msg.author,this.smileEmoji]));
        Application.modules.Discord.setMessageSent();
    }

    simple_parse(msg) {
        var res;
        var alg = msg.content.split("solve");
        if (alg.length > 1 || alg[0][0] !== "<") {

            res = Algebrite.run(alg[1]).toString();
            msg.channel.send(Tools.parseReply(this.config.simple_solve, [msg.author, res]));
            Algebrite.clearall();
        }
        Application.modules.Discord.setMessageSent();
    }

    simple_multi_parse(msg) {
        var res = "";
        var alg = msg.content.split("multi");
        if (alg.length > 1 || alg[0][0] !== "<") {
            alg = alg[1].split(",");
            alg.forEach(item => res = this.do_clac(item));
            msg.channel.send(Tools.parseReply(this.config.simple_multi_solve, [msg.author, res]));
            Algebrite.clearall();
        }
        Application.modules.Discord.setMessageSent();
    }

    do_clac(item) {
        return Algebrite.run(item).toString();
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
