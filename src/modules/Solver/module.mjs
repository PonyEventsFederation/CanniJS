import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";
import solveinworker from "./solve_worker.mjs";

const config = {
	"simple_solve": "%s The result of your operation is:\n\n%s",
	"simple_multi_solve": "%s The end result of your operation chain is:\n\n%s",
	"solver_info": "%s I was upgraded with a simple interface for Algebrite to solve calculations for you.\nUse \"solve (expression)\" to solve a single expression.\nFor multiple expressions use \"solve multi\" and seperate each expression with \",\".\nPlease refer to http://algebrite.org/ to learn about my capabilities. %s",
	"solver_nothing": "%s There is nothing to solve...",
	"solver_no_output": "%s Your last operation doesn't return a value.",
	"single_timeout": 60000,
	"multi_timeout": 90000
};

export const solver = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	let smileEmoji = discord.client.on("message", async msg => {
		if (discord.check_user_access(msg.author) && msg.mentions.has(discord.client.user)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	function handle(msg) {
		if (Tools.msg_starts_mentioned(msg, "solve")) {
			if (Tools.msg_starts_mentioned(msg, "solve multi")) {
				return simple_multi_parse(msg);
			} else if (Tools.msg_starts_mentioned(msg, "solver info")) {
				return info(msg);
			} else {
				return simple_parse(msg);
			}
		}
	}

	function info(msg) {
		msg.channel.send(Tools.parseReply(config.solver_info, [msg.author, smileEmoji]));
		discord.set_message_sent();
	}

	function simple_parse(msg) {
		const alg = msg.content.split("solve");
		if (alg.length > 1 && alg[1] !== "") {
			single(alg[1]).then(function(res) {
				msg.channel.send(Tools.parseReply(config.simple_solve, [msg.author, res])).catch(function(error) {
					if (error.toString().toLowerCase().includes("must be 2000 or fewer in length")) {
						msg.channel.send("I'm sorry. The result of your calculation is too long to be printed in Discord.");
					}
					mi.logger.error(error);
				});
			});
		} else {
			msg.channel.send(Tools.parseReply(config.solver_nothing, [msg.author]));
		}
		discord.set_message_sent();
	}

	function simple_multi_parse(msg) {
		const alg = msg.content.split("multi");
		if (alg.length > 1 && alg[1] !== "") {
			multi(prepareMulti(alg[1].split(","))).then(function(res) {
				if (res === "") {
					msg.channel.send(Tools.parseReply(config.solver_no_output, [msg.author]));
				} else {
					msg.channel.send(Tools.parseReply(config.simple_multi_solve, [msg.author, res])).catch(function(error) {
						if (Tools.msg_contains(error, "must be 2000 or fewer in length")) {
							msg.channel.send("I'm sorry. The result of your calculation is too long to be printed in Discord.");
						}

						mi.logger.error(error);
					});
				}
			});
		} else {
			msg.channel.send(Tools.parseReply(config.solver_nothing, [msg.author]));
		}
		discord.set_message_sent();
	}

	function prepareMulti(pre) {
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

	async function single(data) {
		return await solveinworker("single", data);
	}

	async function multi(data) {
		return await solveinworker("multi", data);
	}
});
