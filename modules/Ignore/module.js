"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
const fs = require('fs');
var idLocation;
var ignore_ids;
var write_to_file = true;
var guild;
//var potato_emo;

module.exports = class Ignore extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            if (Tools.test_ENV("MAIN_SERVER")) {
                guild = Tools.guild_by_id(Application.getClient(), process.env.MAIN_SERVER);
                //potato_emo = Tools.getEmoji(guild,"potato");
            }

            this.load_ignore_ids();



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

                if (msg.isMemberMentioned(Application.getClient().user) && guild) {
                    if (this.is_ignored(msg)) {
                        Application.modules.Discord.setMessageSent();
                        return this.ignored_mentioned(msg);
                    }
                    if (Application.modules.DevCommands.auth_dev_master(msg.author.id)) {
                        if (Tools.msg_contains(msg, "ignore potato")) {
                            return this.potato_ignore(msg);
                        } else if (Tools.msg_contains(msg, "stop ignoring")){
                            return this.potato_stop_ignore(msg);
                        }
                    }
                }

                if (this.is_ignored(msg)) {
                    Application.modules.Discord.setMessageSent();
                    return this.ignored(msg);
                }
            });

            return resolve(this);
        });
    }

    potato_ignore(msg) {
        if (msg.mentions !== null && !msg.mentions.everyone && msg.mentions.users.array().length === 2) {
            var user = msg.mentions.users.array().find(x => x.id !== Application.getClientId());
            this.ignore_id_add(user.id);
            msg.channel.send(Tools.parseReply(this.config.ans_potato_begin_ignore, [msg.author]));
            Application.modules.Discord.setMessageSent();
        }
    }

    potato_stop_ignore(msg) {
        if (msg.mentions !== null && !msg.mentions.everyone && msg.mentions.users.array().length === 2) {
            var user = msg.mentions.users.array().find(x => x.id !== Application.getClientId());
            this.ignore_id_remove(user.id);
            msg.channel.send(Tools.parseReply(this.config.ans_potato_stop_ignore, [msg.author]));
            Application.modules.Discord.setMessageSent();
        }
    }

    ignored(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.potato_ignoredType, false, 'message', undefined, undefined, 600000)) {
            msg.channel.send(Tools.parseReply(this.config.ans_potato_ignore, [msg.author])).then(sentEmbed => {
                //msg.react(potato_emo);
            });
        }
    }

    ignored_mentioned(msg) {
        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.potato_ignored_mentionedType, false, 'message', undefined, undefined, 600000)) {
            msg.channel.send(Tools.parseReply(this.config.ans_potato_ignored_mentioned, [msg.author])).then(sentEmbed => {
                //msg.react(potato_emo);
            });
        }
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }

    is_ignored(msg) {
        let cond = false;
        ignore_ids.forEach(function (id) {
            if (id.toString() === msg.author.id.toString()) {
                cond = true;
            }
        });

        return cond;
    }

    load_ignore_ids () {
        idLocation = Application.config.config_path + "/application/ignore_ids.json";

        if (!fs.existsSync(idLocation)) {
            fs.writeFileSync(idLocation, "[]");
        }

        try {
            ignore_ids = Tools.loadCommentedConfigFile(idLocation);
        } catch (e) {
            throw new Error("config of module ... contains invalid json data: " + e.toString());
        }
    }

    ignore_id_add(id) {
        if (!ignore_ids.includes(id)) {
            ignore_ids.push(id);
            if (write_to_file) {
                fs.writeFile(idLocation, JSON.stringify(ignore_ids), function(err) {
                    if (err) throw err;
                });
            }
            return true;
        }
        return false;
    }

    ignore_id_remove(id) {
        if (ignore_ids.includes(id)) {
            ignore_ids = ignore_ids.filter(item => item !== id);
            if (write_to_file) {
                fs.writeFile(idLocation, JSON.stringify(ignore_ids), function(err) {
                    if (err) throw err;
                });
            }
            return true;
        }
        return false;
    }
};
