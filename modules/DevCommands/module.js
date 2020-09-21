'use strict';

// @IMPORTS
const Application = require('../../lib/Application');
const Module = require('../../lib/Module');
const Promise = require('bluebird');
const Tools = require('../../lib/Tools');
const fs = require('fs');
let dLocation;
let idLocation;
let ids;
let dev_ids;
let dev_master_ids;
let guild;
const write_to_file = true;

module.exports = class DevC extends Module {
    start() {
        return new Promise(resolve => {
            this.log.debug('Starting...');

            this.auth_dev_master = function(id) {
                return dev_master_ids.includes(id);
            };
            this.auth_dev = function(id) {
                return dev_ids.includes(id);
            };

            if (Tools.test_ENV('MAIN_SERVER')) {
                guild = Tools.guild_by_id(Application.getClient(), process.env.MAIN_SERVER);
            }

            this.load_ids();

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

                if (msg.mentions.has(Application.getClient().user) && guild) {
                    if (this.auth_dev_master(msg.author.id)) {
                        if (Tools.msg_contains(msg, 'add dev')) {
                            return this.addDev(msg);
                        }

                        if (Tools.msg_contains(msg, 'remove dev')) {
                            return this.removeDev(msg);
                        }
                    }

                    if (this.auth_dev_master(msg.author.id) || this.auth_dev(msg.author.id)) {
                        if (Tools.msg_contains(msg, 'status report')) {
                            return this.sReport(msg);
                        }

                        if (Tools.msg_contains(msg, 'list devs')) {
                            return this.listDevs(msg);
                        }

                        if (Tools.msg_contains(msg, 'list master devs')) {
                            return this.listMasterDevs(msg);
                        }

                        if (Tools.msg_contains(msg, 'member id')) {
                            return this.memberId(msg);
                        }
                        if (Tools.msg_contains(msg, 'channel id')) {
                            return this.channelId(msg);
                        }
                    }
                }
            });

            return resolve(this);
        });
    }

    addDev(msg) {
        if (!msg.mentions.everyone && msg.mentions.users.array().length === 2) {
            const user = msg.mentions.users.array().find(x => x.id !== Application.getClientId());
            this.id_add(user.id);
            msg.channel.send(Tools.parseReply(this.config.ans_add_dev, [user]));
            Application.modules.Discord.setMessageSent();
        }
    }

    removeDev(msg) {
        if (!msg.mentions.everyone && msg.mentions.users.array().length === 2) {
            const user = msg.mentions.users.array().find(x => x.id !== Application.getClientId());
            this.id_remove(user.id);
            msg.channel.send(Tools.parseReply(this.config.ans_remove_dev, [user]));
            Application.modules.Discord.setMessageSent();
        }
    }

    sReport(msg) {
        msg.channel.send(Tools.parseReply(this.config.ans_status_report, [msg.guild.memberCount]));
        Application.modules.Discord.setMessageSent();
    }

    listMasterDevs(msg) {
        let users = '';
        dev_master_ids.forEach(item => users += guild.members.find(m => m.id === item) + '\n');
        msg.channel.send(Tools.parseReply(this.config.ans_list_master_devs, [users]));
        Application.modules.Discord.setMessageSent();
    }

    listDevs(msg) {
        let users = '';
        dev_ids.forEach(item => users += guild.members.find(m => m.id === item) + '\n');
        msg.channel.send(Tools.parseReply(this.config.ans_list_dev, [users]));
        Application.modules.Discord.setMessageSent();
    }

    memberId(msg) {
        if (msg.channel.type !== 'dm') {
            msg.delete();
        }
        let user;
        if (!msg.mentions.everyone && msg.mentions.users.array().length === 2) {
            user = msg.mentions.users.array().find(x => x.id !== Application.getClientId());
            msg.channel.send(Tools.parseReply(this.config.ans_member_id, [user.username, user.id])).then(message => {message.delete(8000);});
        }
        Application.modules.Discord.setMessageSent();
    }

    channelId(msg) {
        if (msg.channel.type !== 'dm') {
            msg.delete();
        }
        msg.channel.send(Tools.parseReply(this.config.ans_channel_id, [msg.channel.id])).then(message => message.delete(8000));
        Application.modules.Discord.setMessageSent();
    }

    stop() {
        return new Promise(resolve => {
            this.log.debug('Stopping...');
            return resolve(this);
        });
    }

    load_ids() {
        idLocation = Application.config.config_path + '/application/ids.json';
        dLocation = Application.config.config_path + '/Discord.json';

        if (!fs.existsSync(idLocation)) {
            fs.writeFileSync(idLocation, '[[],[]]');
        }

        try {
            const configIds = Tools.loadCommentedConfigFile(idLocation);
            dev_ids = configIds[0];
            dev_master_ids = configIds[1];

            if (fs.existsSync(dLocation)) {
                const dconfig = Tools.loadCommentedConfigFile(dLocation);

                if (dconfig.token.toLowerCase() === 'env') {
                    if (Tools.test_ENV('MASTER_DEV_ID')) {
                        const masters = process.env.MASTER_DEV_ID.split(',');
                        masters.forEach(this.add_master_dev);
                        ids = [dev_ids, dev_master_ids];
                        fs.writeFile(idLocation, JSON.stringify(ids), function(err) {if (err) throw err;});
                    }
                }
            }
        }
        catch (e) {
            throw new Error('config of module ... contains invalid json data: ' + e.toString());
        }


    }

    add_master_dev(item) {
        if (!dev_master_ids.includes(item)) {
            dev_master_ids.push(item);
            if (!dev_ids.includes(item)) dev_ids.push(item);
        }
    }

    id_add(id) {
        if (!dev_ids.includes(id)) {
            dev_ids.push(id);
            ids = [dev_ids, dev_master_ids];
            if (write_to_file) {
                fs.writeFile(idLocation, JSON.stringify(ids), function(err) {
                    if (err) throw err;
                });
            }
            return true;
        }
        return false;
    }

    id_remove(id) {
        if (dev_ids.includes(id)) {
            dev_ids = dev_ids.filter(item => item !== id);
            ids = [dev_ids, dev_master_ids];
            if (write_to_file) {
                fs.writeFile(idLocation, JSON.stringify(ids), function(err) {
                    if (err) throw err;
                });
            }
            return true;
        }
        return false;
    }
};
