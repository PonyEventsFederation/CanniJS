import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import app_config from "../../config/application/config.json" assert { type: "json" };
import Module from "../../lib/Module.mjs";
import Tools from "../../lib/Tools.mjs";
import fs from "fs";
import path from "path";

import config from "../../config/DevCommands.json" assert { type: "json" };

const write_to_file = true;
let dLocation;
let idLocation;
let ids;
let dev_ids;
let dev_master_ids;
let guild;

export const dev_commands = define_module(async mi => {
	if (Tools.test_ENV("MAIN_SERVER")) {
		guild = Tools.guild_by_id((await app.modules).discord.client, process.env["MAIN_SERVER"]);
	}

	load_ids();

	(await app.modules).discord.client.on("message", msg => {
		handle();
	});

	return {
		stop
	};

	function auth_dev_master(id) {
		return dev_master_ids.includes(id);
	}

	function auth_dev(id) {
		return dev_ids.includes(id);
	}

	async function handle(msg) {
		if ((await app.modules).discord.check_user_access(msg.author) && msg.mentions.has((await app.modules).discord.client.user) && guild) {
			if (auth_dev_master(msg.author.id)) {
				processMasterCommands(msg);
			}

			if (auth_dev_master(msg.author.id) || auth_dev(msg.author.id)) {
				processDevCommands(msg);
			}
		}
	}

	function processMasterCommands(msg) {
		if (Tools.msg_contains(msg, "add dev")) {
			return addDev(msg);
		}

		if (Tools.msg_contains(msg, "remove dev")) {
			return removeDev(msg);
		}
	}

	function processDevCommands(msg) {
		if (Tools.msg_contains(msg, "status report")) {
			return sReport(msg);
		}

		if (Tools.msg_contains(msg, "list devs")) {
			return listDevs(msg);
		}

		if (Tools.msg_contains(msg, "list master devs")) {
			return listMasterDevs(msg);
		}

		if (Tools.msg_contains(msg, "member id")) {
			return memberId(msg);
		}
		if (Tools.msg_contains(msg, "channel id")) {
			return channelId(msg);
		}
	}

	async function addDev(msg) {
		if (!msg.mentions.everyone && msg.mentions.users.array().length === 2) {
			let discord_id = (await app.modules).discord.client.user.id;
			const user = msg.mentions.users.array().find(x => x.id !== discord_id);
			id_add(user.id);
			msg.channel.send(Tools.parseReply(config.ans_add_dev, [user]));
			(await app.modules).discord.set_message_sent();
		}
	}

	async function removeDev(msg) {
		if (!msg.mentions.everyone && msg.mentions.users.array().length === 2) {
			let discord_id = (await app.modules).discord.client.user.id;
			const user = msg.mentions.users.array().find(x => x.id !== discord_id);
			id_remove(user.id);
			msg.channel.send(Tools.parseReply(config.ans_remove_dev, [user]));
			(await app.modules).discord.set_message_sent();
		}
	}

	async function sReport(msg) {
		msg.channel.send(Tools.parseReply(config.ans_status_report, [msg.guild.memberCount]));
		(await app.modules).discord.set_message_sent();
	}

	async function listMasterDevs(msg) {
		let users = "";
		dev_master_ids.forEach(item => users += guild.members.find(m => m.id === item) + "\n");
		msg.channel.send(Tools.parseReply(config.ans_list_master_devs, [users]));
		(await app.modules).discord.set_message_sent();
	}

	async function listDevs(msg) {
		let users = "";
		dev_ids.forEach(item => users += guild.members.find(m => m.id === item) + "\n");
		msg.channel.send(Tools.parseReply(config.ans_list_dev, [users]));
		(await app.modules).discord.set_message_sent();
	}

	async function memberId(msg) {
		if (msg.channel.type !== "dm") {
			setTimeout(() => msg.delete(), app_config.deleteDelay);
		}
		let user;
		if (!msg.mentions.everyone && msg.mentions.users.array().length === 2) {
			let discord_id = (await app.modules).discord.client.user.id;
			user = msg.mentions.users.array().find(x => x.id !== discord_id);
			msg.channel.send(Tools.parseReply(config.ans_member_id, [user.username, user.id])).then(message => {message.delete(8000);});
		}
		(await app.modules).discord.set_message_sent();
	}

	async function channelId(msg) {
		if (msg.channel.type !== "dm") {
			setTimeout(() => msg.delete(), app_config.deleteDelay);
		}
		msg.channel.send(Tools.parseReply(config.ans_channel_id, [msg.channel.id])).then(message => message.delete(8000));
		(await app.modules).discord.set_message_sent();
	}

	function load_ids() {
		idLocation = path.resolve("./src/config/application/ids.json");
		dLocation = path.resolve("./src/config/Discord.json");

		if (!fs.existsSync(idLocation)) {
			fs.writeFileSync(idLocation, "[[],[]]");
		}

		const configIds = Tools.loadCommentedConfigFile(idLocation);
		dev_ids = configIds[0];
		dev_master_ids = configIds[1];

		if (fs.existsSync(dLocation)) {
			const dconfig = Tools.loadCommentedConfigFile(dLocation);

			if (dconfig.token.toLowerCase() === "env") {
				if (Tools.test_ENV("MASTER_DEV_ID")) {
					const masters = process.env["MASTER_DEV_ID"].split(",");
					masters.forEach(add_master_dev);
					ids = [dev_ids, dev_master_ids];
					fs.writeFile(idLocation, JSON.stringify(ids), function(err) {if (err) throw err;});
				}
			}
		}
		// try {
		// } catch (e) {
		// 	throw new Error("config of module ... contains invalid json data: " + e.toString());
		// }
	}

	function add_master_dev(item) {
		if (!dev_master_ids.includes(item)) {
			dev_master_ids.push(item);
			if (!dev_ids.includes(item)) dev_ids.push(item);
		}
	}

	function id_add(id) {
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

	function id_remove(id) {
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
});

export default class DevC extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			this.auth_dev_master = function(id) {
				return dev_master_ids.includes(id);
			};
			this.auth_dev = function(id) {
				return dev_ids.includes(id);
			};

			if (Tools.test_ENV("MAIN_SERVER")) {
				guild = Tools.guild_by_id(Application.getClient(), process.env["MAIN_SERVER"]);
			}

			this.load_ids();

			Application.modules.Discord.client.on("message", (msg) => {
				this.handle(msg);
			});

			return resolve(this);
		});
	}

	handle(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author) && msg.mentions.has(Application.getClient().user) && guild) {
			if (this.auth_dev_master(msg.author.id)) {
				this.processMasterCommands(msg);
			}

			if (this.auth_dev_master(msg.author.id) || this.auth_dev(msg.author.id)) {
				this.processDevCommands(msg);
			}
		}
	}

	processMasterCommands(msg) {
		if (Tools.msg_contains(msg, "add dev")) {
			return this.addDev(msg);
		}

		if (Tools.msg_contains(msg, "remove dev")) {
			return this.removeDev(msg);
		}
	}

	processDevCommands(msg) {
		if (Tools.msg_contains(msg, "status report")) {
			return this.sReport(msg);
		}

		if (Tools.msg_contains(msg, "list devs")) {
			return this.listDevs(msg);
		}

		if (Tools.msg_contains(msg, "list master devs")) {
			return this.listMasterDevs(msg);
		}

		if (Tools.msg_contains(msg, "member id")) {
			return this.memberId(msg);
		}
		if (Tools.msg_contains(msg, "channel id")) {
			return this.channelId(msg);
		}
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
		let users = "";
		dev_master_ids.forEach(item => users += guild.members.find(m => m.id === item) + "\n");
		msg.channel.send(Tools.parseReply(this.config.ans_list_master_devs, [users]));
		Application.modules.Discord.setMessageSent();
	}

	listDevs(msg) {
		let users = "";
		dev_ids.forEach(item => users += guild.members.find(m => m.id === item) + "\n");
		msg.channel.send(Tools.parseReply(this.config.ans_list_dev, [users]));
		Application.modules.Discord.setMessageSent();
	}

	memberId(msg) {
		if (msg.channel.type !== "dm") {
			setTimeout(() => msg.delete(), config.deleteDelay);
		}
		let user;
		if (!msg.mentions.everyone && msg.mentions.users.array().length === 2) {
			user = msg.mentions.users.array().find(x => x.id !== Application.getClientId());
			msg.channel.send(Tools.parseReply(this.config.ans_member_id, [user.username, user.id])).then(message => {message.delete(8000);});
		}
		Application.modules.Discord.setMessageSent();
	}

	channelId(msg) {
		if (msg.channel.type !== "dm") {
			setTimeout(() => msg.delete(), config.deleteDelay);
		}
		msg.channel.send(Tools.parseReply(this.config.ans_channel_id, [msg.channel.id])).then(message => message.delete(8000));
		Application.modules.Discord.setMessageSent();
	}

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}

	load_ids() {
		idLocation = Application.config.config_path + "/application/ids.json";
		dLocation = Application.config.config_path + "/Discord.json";

		if (!fs.existsSync(idLocation)) {
			fs.writeFileSync(idLocation, "[[],[]]");
		}

		const configIds = Tools.loadCommentedConfigFile(idLocation);
		dev_ids = configIds[0];
		dev_master_ids = configIds[1];

		if (fs.existsSync(dLocation)) {
			const dconfig = Tools.loadCommentedConfigFile(dLocation);

			if (dconfig.token.toLowerCase() === "env") {
				if (Tools.test_ENV("MASTER_DEV_ID")) {
					const masters = process.env["MASTER_DEV_ID"].split(",");
					masters.forEach(this.add_master_dev);
					ids = [dev_ids, dev_master_ids];
					fs.writeFile(idLocation, JSON.stringify(ids), function(err) {if (err) throw err;});
				}
			}
		}
		// try {
		// } catch (e) {
		// 	throw new Error("config of module ... contains invalid json data: " + e.toString());
		// }
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
}
