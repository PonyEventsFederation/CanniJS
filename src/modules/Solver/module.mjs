import Application from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";
import solveinworker from "./solve_worker.mjs";

export default class Solver extends Module {
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

	info(msg) {
		msg.channel.send(Tools.parseReply(this.config.solver_info, [msg.author, this.smileEmoji]));
		Application.modules.Discord.setMessageSent();
	}

	simple_parse(msg) {
		const config = this.config;
		const alg = msg.content.split("solve");
		if (alg.length > 1 && alg[1] !== "") {
			this.single(alg[1]).then(function(res) {
				msg.channel.send(Tools.parseReply(config.simple_solve, [msg.author, res])).catch(function(error) {
					if (error.toString().toLowerCase().includes("must be 2000 or fewer in length")) {
						msg.channel.send("I'm sorry. The result of your calculation is too long to be printed in Discord.");
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
		const config = this.config;
		const alg = msg.content.split("multi");
		if (alg.length > 1 && alg[1] !== "") {
			this.multi(this.prepareMulti(alg[1].split(","))).then(function(res) {
				if (res === "") {
					msg.channel.send(Tools.parseReply(config.solver_no_output, [msg.author]));
				} else {
					msg.channel.send(Tools.parseReply(config.simple_multi_solve, [msg.author, res])).catch(function(error) {
						if (Tools.msg_contains(error, "must be 2000 or fewer in length")) {
							msg.channel.send("I'm sorry. The result of your calculation is too long to be printed in Discord.");
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

	async single(data) {
		return await solveinworker("single", data);
	}

	async multi(data) {
		return await solveinworker("multi", data);
	}

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
}
