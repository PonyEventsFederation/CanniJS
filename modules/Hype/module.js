"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
var path;

module.exports = class Hype extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            path = Application.config.rootDir + "/data/hype.gif";

            this.bizaamEmoji = Application.modules.Discord.getEmoji('bizaam');

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

                if (Tools.strContainsWord(msg.content, 'hype')) {
                    return this.hype(msg);
                }
            });

            return resolve(this);
        });
    }

    hype(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.hypeType, false , undefined, undefined, undefined, 120000)) {
            msg.channel.send(Tools.parseReply(this.config.ans_hype, [this.bizaamEmoji]), {files:[path]});

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
