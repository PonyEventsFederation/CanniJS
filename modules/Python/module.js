"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
var spawn = require('child_process').spawn;
var data_receive;
var config;

module.exports = class Python extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");
            data_receive = this.data_receive;
            config = this.config;

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
                    if (Tools.msg_starts_mentioned(msg,'python test')) {
                        //return this.test1();
                        //return this.test2();
                        return this.py_test(msg);
                    }
                }
            });

            return resolve(this);
        });
    }

    py_test(msg) {
        let parse = msg.content.split(" ");
        if (parse.length === 4) {parse = parse[3]}
        else {parse = "--empty--"}
        let py = this.create('modules/Python/scripts/test.py');
        this.data_send(py, parse);

        py.stdout.on('data', function(data){
            py.kill();
            let res = data_receive(data);
            msg.channel.send(Tools.parseReply(config.pytest, [res]));
        });

        Application.modules.Discord.setMessageSent();
    }

    create(path) {
        let py = spawn('python', [path]);
        py.stderr.on('data', (data) => {
            console.log("Python error: " + data.toString());
        });
        return py;
    }

    data_send(py, data) {
        py.stdin.write(JSON.stringify(data));
        py.stdin.end();
    }

    data_receive(data) {
        return JSON.parse(data.toString());
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
