"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");
const fs = require("fs");
/** @type { Array<string> } */
let help_list;

/** @extends { Module<import("../../config/Help.json")> } */
module.exports = class Help extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			const path = Application.config.config_path + "/Text/help.txt";

			// fs.readFile(path, function(err, buf) {
			// 	if (err) this.log.error(err);
			// 	help_list = prep(buf.toString());
			// });

			help_list = this.prepare_help(fs.readFileSync(path, "utf8"));

			Application.modules.Discord.addCommand(
				"help",
				/** @param { import("discord.js").Message } msg */
				msg => this.help(msg)
			);

			return resolve(this);
		});
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	help(msg) {
		this.recursiveSender(msg, 0);
		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { number } counter
	 */
	// TODO: this does not need to be recursive
	recursiveSender(msg, counter) {
		msg.author.send(Tools.parseReply(
			help_list[counter] + "_ _",
			msg.author.toString()
		)).then(() => {
			if (counter < help_list.length - 1) {
				this.recursiveSender(msg, counter + 1);
			}
		}).catch(function(error) {
			Application.modules.Help.log.error(error);
		});
	}

	/**
	 * @param { string } data_in
	 */
	prepare_help(data_in) {
		const pre = [];
		let tmp = "";

		let data_arr = data_in.split("\n\n");
		// handle crlf line endings
		if (data_arr.length === 1) data_arr = data_arr[0].split("\r\n\r\n");
		const first = data_arr.shift();

		data_arr.forEach((item, index, array) => {
			tmp += item + "\n";
			pre.push(tmp);

			if (tmp.length >= 1999) this.log.error("Help Paragraph too long.");

			tmp = (index === (array.length - 1)) ? "" : "\n";
		});

		pre.push(tmp);
		tmp = "";

		let count = 0;
		/** @type { Array<string> } */
		const res = [];
		res.push(first);

		pre.forEach(item => {
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
};
