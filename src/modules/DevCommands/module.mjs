import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import app_config from "../../config/application/config.json" assert { type: "json" };
import Tools from "../../lib/Tools.mjs";
import fs from "fs";
import path from "path";

const config = {
	"ans_add_dev": "%s You are now a Canni developer.\nPlease don't break me...",
	"ans_remove_dev": "%s You are no longer a developer. Still, thank you for your hard work.",
	"ans_debug_author_id": "Your id is: %s",
	"ans_status_report": "Everything seems to be fine.\nThere are currently: %s server members.",
	"ans_list_dev": "Authorised Canni developers are:\n%s",
	"ans_list_master_devs": "Authorised Canni masters devs are:\n%s",
	"ans_member_id": "The id of %s is: %s",
	"ans_channel_id": "The channel id is : %s"
};

const write_to_file = true;
let guild;

export const dev_commands = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	if (Tools.test_ENV("MAIN_SERVER")) {
		guild = Tools.guild_by_id(discord.client, process.env["MAIN_SERVER"]);
	}

	discord.client.on("message", msg => {
		handle(msg);
	});

	return {
		stop
	};

	async function handle(msg) {
		if (discord.check_user_access(msg.author) && msg.mentions.has(discord.client.user) && guild) {
			if (discord.auth_dev_master(msg.author.id)) {
				processMasterCommands(msg);
			}

			if (discord.auth_dev_master(msg.author.id) || discord.auth_dev(msg.author.id)) {
				processDevCommands(msg);
			}
		}
	}

	function processMasterCommands(msg) {
		// if (Tools.msg_contains(msg, "add dev")) {
		// 	addDev(msg);
		// }

		// if (Tools.msg_contains(msg, "remove dev")) {
		// 	removeDev(msg);
		// }
	}

	function processDevCommands(msg) {
		if (Tools.msg_contains(msg, "status report")) {
			sReport(msg);
		}

		if (Tools.msg_contains(msg, "list devs")) {
			listDevs(msg);
		}

		if (Tools.msg_contains(msg, "list master devs")) {
			listMasterDevs(msg);
		}

		if (Tools.msg_contains(msg, "member id")) {
			memberId(msg);
		}
		if (Tools.msg_contains(msg, "channel id")) {
			channelId(msg);
		}
	}

	// async function addDev(msg) {
	// 	if (!msg.mentions.everyone && msg.mentions.users.array().length === 2) {
	// 		// @ts-expect-error
	// 		let discord_id = discord.client.user.id;
	// 		const user = msg.mentions.users.array().find(x => x.id !== discord_id);
	// 		id_add(user.id);
	// 		msg.channel.send(Tools.parseReply(config.ans_add_dev, [user]));
	// 		discord.set_message_sent();
	// 	}
	// }

	// async function removeDev(msg) {
	// 	if (!msg.mentions.everyone && msg.mentions.users.array().length === 2) {
	// 		// @ts-expect-error
	// 		let discord_id = discord.client.user.id;
	// 		const user = msg.mentions.users.array().find(x => x.id !== discord_id);
	// 		id_remove(user.id);
	// 		msg.channel.send(Tools.parseReply(config.ans_remove_dev, [user]));
	// 		discord.set_message_sent();
	// 	}
	// }

	async function sReport(msg) {
		msg.channel.send(Tools.parseReply(config.ans_status_report, [msg.guild.memberCount]));
		discord.set_message_sent();
	}

	async function listMasterDevs(msg) {
		let users = "";
		discord.dev_master_ids.forEach(item => users += guild.members.find(m => m.id === item) + "\n");
		msg.channel.send(Tools.parseReply(config.ans_list_master_devs, [users]));
		discord.set_message_sent();
	}

	async function listDevs(msg) {
		let users = "";
		discord.dev_ids.forEach(item => users += guild.members.find(m => m.id === item) + "\n");
		msg.channel.send(Tools.parseReply(config.ans_list_dev, [users]));
		discord.set_message_sent();
	}

	async function memberId(msg) {
		if (msg.channel.type !== "dm") {
			setTimeout(() => msg.delete(), app_config.deleteDelay);
		}
		let user;
		if (!msg.mentions.everyone && msg.mentions.users.array().length === 2) {
			// @ts-expect-error
			let discord_id = discord.client.user.id;
			user = msg.mentions.users.array().find(x => x.id !== discord_id);
			msg.channel.send(Tools.parseReply(config.ans_member_id, [user.username, user.id])).then(message => {message.delete(8000);});
		}
		discord.set_message_sent();
	}

	async function channelId(msg) {
		if (msg.channel.type !== "dm") {
			setTimeout(() => msg.delete(), app_config.deleteDelay);
		}
		msg.channel.send(Tools.parseReply(config.ans_channel_id, [msg.channel.id])).then(message => message.delete(8000));
		discord.set_message_sent();
	}

	// function add_master_dev(item) {
	// 	if (!discord.dev_master_ids.includes(item)) {
	// 		discord.dev_master_ids.push(item);
	// 		if (!discord.dev_ids.includes(item)) dev_ids.push(item);
	// 	}
	// }

	// function id_add(id) {
	// 	if (!dev_ids.includes(id)) {
	// 		dev_ids.push(id);
	// 		ids = [dev_ids, dev_master_ids];
	// 		if (write_to_file) {
	// 			fs.writeFile(idLocation, JSON.stringify(ids), function(err) {
	// 				if (err) throw err;
	// 			});
	// 		}
	// 		return true;
	// 	}
	// 	return false;
	// }

	// function id_remove(id) {
	// 	if (dev_ids.includes(id)) {
	// 		dev_ids = dev_ids.filter(item => item !== id);
	// 		ids = [dev_ids, dev_master_ids];
	// 		if (write_to_file) {
	// 			fs.writeFile(idLocation, JSON.stringify(ids), function(err) {
	// 				if (err) throw err;
	// 			});
	// 		}
	// 		return true;
	// 	}
	// 	return false;
	// }
});
