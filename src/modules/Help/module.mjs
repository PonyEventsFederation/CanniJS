import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";
import fs from "fs";
import fsp from "fs/promises";
import { resolve as resolve_path } from "path";

export const help = define_module(async mi => {
	const path = resolve_path("./src/config/Text/help.txt");

	const help_list = prepare_help(await fsp.readFile(path));
	(await app.modules).discord.add_command("help", help);

	return {
		stop
	};

	async function help(msg) {
		recursiveSender(msg, 0);
		(await app.modules).discord.set_message_sent();
	}

	// TODO this doesn't need to be recursive, change it into a for loop or something
	async function recursiveSender(msg, counter) {
		await msg.author.send(Tools.parseReply(help_list[counter] + "_ _", [msg.author]));
		if (counter < help_list.length - 1) {
			recursiveSender(msg, counter + 1);
		}
	}

	function prepare_help(data_in) {
		const pre = [];
		let tmp = "";

		data_in = data_in.split("\n\n");
		// handle crlf line endings
		if (data_in.length === 1) data_in = data_in[0].split("\r\n\r\n");
		const first = data_in.shift();

		data_in.forEach(function(item, index, array) {
			tmp += item + "\n";
			pre.push(tmp);

			if (tmp.length >= 1999) mi.logger.fatal("Help Paragraph too long.");

			tmp = (index === (array.length - 1)) ? "" : "\n";
		});

		pre.push(tmp);
		tmp = "";
		let count = 0;
		const res = [];
		res.push(first);

		pre.forEach(function(item) {
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
});

export default class Help extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			const path = Application.config.config_path + "/Text/help.txt";
			const prep = this.prepare_help;

			fs.readFile(path, function(err, buf) {
				if (err) this.log.error(err);
				help_list = prep(buf.toString());
			});

			Application.modules.Discord.addCommand("help", (msg) => {
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
		msg.author.send(Tools.parseReply(help_list[counter] + "_ _", [msg.author])).then(function() {
			if (counter < help_list.length - 1) {
				sender(msg, counter + 1, sender);
			}
		}).catch(function(error) {
			Application.modules.Help.log.error(error);
		});
	}

	prepare_help(data_in) {
		const pre = [];
		let tmp = "";

		data_in = data_in.split("\n\n");
		// handle crlf line endings
		if (data_in.length === 1) data_in = data_in[0].split("\r\n\r\n");
		const first = data_in.shift();

		data_in.forEach(function(item, index, array) {
			tmp += item + "\n";
			pre.push(tmp);

			if (tmp.length >= 1999) Application.modules.Help.log.error("Help Paragraph too long.");

			tmp = (index === (array.length - 1)) ? "" : "\n";
		});

		pre.push(tmp);
		tmp = "";
		let count = 0;
		const res = [];
		res.push(first);

		pre.forEach(function(item) {
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
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
}
