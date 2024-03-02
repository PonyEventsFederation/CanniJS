"use strict";

// @IMPORTS
const Application = require("../lib/Application");

const Module = require("../lib/Module");
const Tools = require("../lib/Tools");
const solveinworker = require("./solver-worker");

/** @extends { Module<import("./solver-config.json")> } */
module.exports = class Solver extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			this.smileEmoji = Application.modules.Discord.getEmoji("gc_cannismile");

			Application.modules.Discord.client.on("message", (msg) => {
				if (Application.modules.Discord.checkUserAccess(msg.author) && msg.mentions.has(Application.getClient().user)) {
					this.handle(msg);
				}
			});

			return resolve(this);
		});
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	handle(msg) {
		if (Tools.msg_starts_mentioned(msg, "solve")) {
			if (Tools.msg_starts_mentioned(msg, "solve multi")) {
				return this.simple_multi_parse(msg);
			} else if (Tools.msg_starts_mentioned(msg, "solver info")) {
				return this.info(msg);
			} else {
				return this.simple_parse(msg);
			}
		}
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	info(msg) {
		msg.channel.send(Tools.parseReply(
			this.config.solver_info,
			msg.author.toString(),
			this.smileEmoji.toString()
		));
		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	simple_parse(msg) {
		const config = this.config;
		const alg = msg.content.split("solve");
		if (alg.length > 1 && alg[1] !== "") {
			this.single(alg[1]).then(function(res) {
				msg.channel.send(Tools.parseReply(config.simple_solve, msg.author.toString(), res)).catch(function(error) {
					if (error.toString().toLowerCase().includes("must be 2000 or fewer in length")) {
						msg.channel.send("I'm sorry. The result of your calculation is too long to be printed in Discord.");
					}
					Application.log.error(error);
				});
			});
		} else {
			msg.channel.send(Tools.parseReply(
				this.config.solver_nothing,
				msg.author.toString()
			));
		}
		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	simple_multi_parse(msg) {
		const config = this.config;
		const alg = msg.content.split("multi");
		if (alg.length > 1 && alg[1] !== "") {
			this.multi(this.prepareMulti(alg[1].split(","))).then(function(res) {
				if (res === "") {
					msg.channel.send(Tools.parseReply(config.solver_no_output, msg.author.toString()));
				} else {
					msg.channel.send(Tools.parseReply(
						config.simple_multi_solve,
						msg.author.toString(),
						res
					)).catch(function(error) {
						if (
							Tools.msg_contains(error, "must be 2000 or fewer in length")
							|| Tools.msg_contains(error, "must be 4000 or fewer in length")
						) {
							msg.channel.send("I'm sorry. The result of your calculation is too long to be printed in Discord.");
						}

						Application.log.error(error);
					});
				}
			});
		} else {
			msg.channel.send(Tools.parseReply(this.config.solver_nothing, msg.author.toString()));
		}
		Application.modules.Discord.setMessageSent();
	}

	/**
	 * @param { Array<string> } pre
	 */
	prepareMulti(pre) {
		const data = [];
		let append_string = "";
		let append_status = 0;
		let i;
		for (i = 0; i < pre.length; i++) {
			let state = 0;
			let a = 0;
			for (a = 0; a < pre[i].length; a++) {
				if (pre[i][a] === "(") {
					state++;
				}
				if (pre[i][a] === ")") {
					state--;
				}
			}
			if (state === 0 && append_status === 0) {
				data.push(pre[i]);
			} else if (state > 0) {
				append_status = 1;
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

	/**
	 * @param { string } alg
	 */
	single(alg) {
		return solveinworker("single", alg);
	}

	/**
	 * @param { Array<string> } alg
	 */
	multi(alg) {
		return solveinworker("multi", alg);
	}
};
