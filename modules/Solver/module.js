"use strict";

// @IMPORTS
const Application = require("../../lib/Application");

const worker = require('worker');
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
var calc_runing = {};

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

    log_calc(id) {
        //console.log("Calc logged");
        calc_runing[id.toString()] = true;
    }

    end_calc(id) {
        //console.log("Calc ended");
        calc_runing[id.toString()] = false;
    }

    remove_calc(id) {
        //console.log("Calc removed");
        delete calc_runing[id.toString()];
    }

    final_check_calc(id) {
        if (calc_runing[id.toString()]) {
            this.remove_calc(id);
            return true;
        } else {
            this.remove_calc(id);
            return false;
        }
    }

    simple_parse(msg) {
        let config = this.config;
        var alg = msg.content.split("solve");
        if (alg.length > 1 && alg[1] !== "") {
            this.log_calc(msg.id);
            this.single(alg[1], this, msg.id).then(function(value) {
                let res = value[0];
                let obj = value[1];
                let id = value[2];
                obj.end_calc(id);
                value[3].kill();
                msg.channel.send(Tools.parseReply(config.simple_solve, [msg.author, res])).catch(function (error) {
                    if (error.toString().toLowerCase().includes('must be 2000 or fewer in length')) {
                        msg.channel.send('I\'m sorry. The result of your calculation is too long to be printed in Discord.');
                    }
                    Application.log.error(error);
               });
            });
        } else {
            msg.channel.send(Tools.parseReply(this.config.solver_nothing, [msg.author]));
        }
        Application.modules.Discord.setMessageSent();
    }

    simple_multi_parse(msg) {
        let config = this.config;
        var alg = msg.content.split("multi");
        if (alg.length > 1 && alg[1] !== "") {
            this.multi(this.prepareMulti(alg[1].split(",")), this, msg.id).then(function(value) {
                let res = value[0];
                let obj = value[1];
                let id = value[2];
                obj.end_calc(id);
                value[3].kill();
                if (res === "") {
                    msg.channel.send(Tools.parseReply(config.solver_no_output, [msg.author]));
                } else {
                    msg.channel.send(Tools.parseReply(config.simple_multi_solve, [msg.author, res])).catch(function (error) {
                        if (Tools.msg_contains(error, 'must be 2000 or fewer in length')) {
                            msg.channel.send('I\'m sorry. The result of your calculation is too long to be printed in Discord.');
                        }

                        Application.log.error(error);
                   });
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

    async single(data, obj, id) {
        var wor = worker.spawn('solve_worker.js');
        setTimeout(function(){
            if (obj.final_check_calc(id)) {
                wor.kill();
                Application.log.info(`Killed single worker after reaching its timeout of ${Application.modules.Solver.config.single_timeout / 1000} seconds.`);
            }
        }, this.config.single_timeout);
        return [await wor.run('do_calc', [data]), obj, id, wor];
    }

    async multi(data, obj, id) {
        var wor = worker.spawn('solve_worker.js');
        setTimeout(function(){
            if (obj.final_check_calc(id)) {
                wor.kill();
                Application.log.info(`Killed multi worker after reaching its timeout of ${Application.modules.Solver.multi_timeout / 1000} seconds.`);
            }
        }, this.config.multi_timeout);
        return [await wor.run('do_multi_calc', [data]), obj, id, wor];
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
