"use strict";

// @IMPORTS
const Application = require("../../lib/Application");

const worker = require('worker');
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

var single_timeout = 60000;
var multi_timeout = 90000;

module.exports = class Solver extends Module {
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
        let config = this.config;
        var alg = msg.content.split("solve");
        if (alg.length > 1 && alg[1] !== "") {
            this.single(alg[1]).then(function(value) {
                msg.channel.send(Tools.parseReply(config.simple_solve, [msg.author, value]));
            });
        } else {
            msg.channel.send(Tools.parseReply(this.config.solver_nothing, [msg.author]));
        }
        Application.modules.Discord.setMessageSent();
    }

    simple_multi_parse(msg) {
        let config = this.config;
        var res = "";
        var alg = msg.content.split("multi");
        if (alg.length > 1 && alg[1] !== "") {
            this.multi(this.prepareMulti(alg[1].split(","))).then(function(value) {
                if (value === "") {
                    msg.channel.send(Tools.parseReply(config.solver_no_output, [msg.author]));
                } else {
                    msg.channel.send(Tools.parseReply(config.simple_multi_solve, [msg.author, value]));
                }
            });
        } else {
            msg.channel.send(Tools.parseReply(this.config.solver_nothing, [msg.author]));
        }
        Application.modules.Discord.setMessageSent();
    }

    prepareMulti(pre) {
        var data = [];
        var append_string = "";
        var append_status = 0;
        for (var i = 0; i < pre.length; i++) {
            var state = 0;
            for (var a = 0; a < pre[i].length; a++) {
                if (pre[i][a] === '(') {
                    state++;
                }
                if (pre[i][a] === ')') {
                    state--;
                }
            }
            if (state === 0 && append_status === 0) {
                data.push(pre[i])
            } else if (state > 0) {
                append_status = 1
            } else if (state < 0) {
                append_status = 0;
                append_string += pre[i];
                data.push(append_string);
                append_string = "";
            }
            if (append_status === 1) {
                append_string += pre[i] + ",";
            }
        }
        return data;
    }

    async single(data) {
        var wor = worker.spawn('solve_worker.js');
        setTimeout(function(){
            wor.kill();
            console.log("Killed");
        }, single_timeout);
        return await wor.run('do_calc', [data]);
    }

    async multi(data) {
        var wor = worker.spawn('solve_worker.js');
        setTimeout(function(){
            wor.kill();
            console.log("Killed");
        }, multi_timeout);
        return await wor.run('do_multi_calc', [data]);
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
