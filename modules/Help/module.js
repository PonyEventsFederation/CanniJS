"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
var fs = require("fs");
var help_list;

module.exports = class Help extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            let path = Application.config.config_path + "/Text/help.txt";
            let prep = this.prepare_help;
            fs.readFile(path, function(err, buf) {
                if (err) { console.log(err) }
                help_list = prep(buf.toString());
            });

            Application.modules.Discord.addCommand('help', (msg) => {
                return this.help(msg);
            });

            return resolve(this);
        });
    }

    help(msg) {
        let recursiveSender = this.recursiveSender;
        this.recursiveSender(msg, 0, recursiveSender);
        Application.modules.Discord.setMessageSent();
    }

    recursiveSender(msg, counter, sender) {
        msg.author.send(Tools.parseReply(help_list[counter], [msg.author])).then(function (res) {
            if (counter < help_list.length-1) {
                sender(msg, counter+1, sender);
            }
        });
    }

    prepare_help(data_in) {
        let pre = [];
        let tmp = "";
        data_in = data_in.split("\n");
        let first = data_in.shift()+ "\n";
        data_in.forEach(function (item) {
            if (item !== "\r") {tmp += item + "\n";}
            else {
                tmp += item + "\n";
                pre.push(tmp);
                if (tmp.length >= 1999) {console.log("Warning Help Paragraph to long.")}
                tmp = "";
            }
        });
        pre.push(tmp);
        tmp = "";
        let count = 0;
        let res = [];
        res.push(first);
        pre.forEach(function (item) {
            if (count + item.length < 1999) {
                tmp += item;
                count += item.length;
            } else {
                res.push(tmp);
                tmp = item;
                count = item.length;
            }
        });
        res.push(tmp);
        return res;
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");

            return resolve(this);
        })
    }
};
