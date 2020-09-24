'use strict';

// @IMPORTS
const Application = require('../../lib/Application');
const Module = require('../../lib/Module');
const Promise = require('bluebird');
const Tools = require('../../lib/Tools');
const fs = require('fs');
let help_list;

module.exports = class Help extends Module {
    start() {
        return new Promise(resolve => {
            this.log.debug('Starting...');

            const path = Application.config.config_path + '/Text/help.txt';
            const prep = this.prepare_help;

            fs.readFile(path, function(err, buf) {
                if (err) this.log.error(err);
                help_list = prep(buf.toString());
            });

            Application.modules.Discord.addCommand('help', (msg) => {
                return this.help(msg);
            });

            return resolve(this);
        });
    }

    help(msg) {
        const recursiveSender = this.recursiveSender;
        this.recursiveSender(msg, 0, recursiveSender);
        Application.modules.Discord.setMessageSent();
    }

    recursiveSender(msg, counter, sender) {
        msg.author.send(Tools.parseReply(help_list[counter] + '_ _', [msg.author])).then(function() {
            if (counter < help_list.length - 1) {
                sender(msg, counter + 1, sender);
            }
        }).catch(function(error) {
            Application.modules.Help.log.error(error);
        });
    }

    prepare_help(data_in) {
        const pre = [];
        let tmp = '';

        data_in = data_in.split('\n\n');
        // handle crlf line endings
        if (data_in.length === 1) data_in = data_in[0].split('\r\n\r\n');
        const first = data_in.shift();

        data_in.forEach(function(item, index, array) {
            tmp += item + '\n';
            pre.push(tmp);

            if (tmp.length >= 1999) Application.modules.Help.log.error('Help Paragraph too long.');

            tmp = (index === (array.length - 1)) ? '' : '\n';
        });

        pre.push(tmp);
        tmp = '';
        let count = 0;
        const res = [];
        res.push(first);

        pre.forEach(function(item) {
            if (count + item.length < 1999) {
                tmp += item;
                count += item.length;
            }
            else {
                res.push(tmp);
                tmp = item;
                count = item.length;
            }
        });

        res.push(tmp);
        return res;
    }

    stop() {
        return new Promise(resolve => {
            this.log.debug('Stopping...');
            return resolve(this);
        });
    }
};
