import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import app_config from "../../config/application/config.json" assert { type: "json" };
import Database from "../../lib/Database.mjs";
import Module from "../../lib/Module.mjs";
import Tools from "../../lib/Tools.mjs";
import moment from "moment";
import config from "../../config/Boop.json" assert { type: "json" };
import { resolve as resolve_path } from "path";
const path = resolve_path("./src/data/impact.gif");
let boop_dev_on = true;
let wachmann_id;
const boopDeleteTimeout = 40000;

export const boop = define_module(async mi => {
	let boopCooldown = new Set();
	let messageSent = new Set();
	let interrupt = { inter: false };
	let megaon = false;

	if (Tools.test_ENV("WACHMANN_ID")) {
		wachmann_id = process.env["WACHMANN_ID"];
	}

	(await app.modules).discord.client.on("message", async msg => {
		if ((await app.modules).discord.check_user_access(msg.author)) {
			handle()
		}
	});

	return {
		stop
	};

	async function handle(msg) {
		if (Tools.strStartsWord(msg.content, "boop") && !msg.mentions.everyone && msg.mentions.users.array().length > 0) {
			const users = msg.mentions.members?.array() || [];

			if (users.length > config.boopLimit) {
				setCooldown(msg, users);
			}

			if (!(await app.modules).discord.has_cooldown(msg.author.id, config.boopType)) {
				processBoops(msg, users);
				// todo
			}
		}

		if (megaon) {
			processBlocks(msg);
			// todo?
		} else if (boop_dev_on) {
			// todo
			processMegaboops(msg);
			processUltraBoops(msg);
		}
	}

	async function processBoops(msg, users) {
		for (let i = 0; i < users.length; i++) {
			if ((await app.modules).discord.check_self(users[i].id)) {
				selfBoop(msg);
				continue;
			}

			if (wachmann_id === users[i].id) {
				wachmannBoop(msg, users[i]);
				continue;
			}

			boop(msg, users[i]);
		}
	}

	async function processBlocks(msg) {
		if ((await app.modules).dev_commands.auth_dev(msg.author.id)) {
			if (Tools.strStartsWord(msg.content, "devblock")) {
				return counter(msg, "DevBlock");
			} else if (Tools.strStartsWord(msg.content, "devcounter")) {
				return counter(msg, "DevCounter");
			}
		}

		if (Tools.strStartsWord(msg.content, "block")) {
			const now = moment();
			const val = moment().endOf("day");
			const blockTimeout = val.diff(now, "milliseconds");
			if ((await app.modules).discord.control_talked_recently(msg, config.megaBoopType, false, "message", undefined, undefined, blockTimeout)) {
				return counter(msg, "Block");
			}
		}
	}

	async function processMegaboops(msg) {
		if (Tools.strStartsWord(msg.content, "megaboop")) {
			if (!msg.mentions.everyone && msg.mentions.users.array().length === 1) {
				const user = msg.mentions.users.array()[0];
				if ((await app.modules).discord.check_self(user.id)) {
					return megaSelfBoop(msg);
				}

				Database.getTimeout(msg.author.id, "megaboop").then((results) => {
					if (results.length == 0) {
						Database.setTimeout(msg.author.id, "megaboop");
						return megaBoopLoader(msg, user);
					} else {
						const cooldownMessage = Tools.parseReply(config.cooldownMessageMegaBoop, [msg.author]);
						msg.channel.send(cooldownMessage);
					}
				}).catch((err) => {
					mi.logger.error("Promise rejection error: " + err);
				});

				(await app.modules).discord.set_message_sent();
			}
		}
	}

	async function processUltraBoops(msg) {
		if (Tools.msg_starts(msg, "master chief dev ultra boop") ||
        Tools.msg_starts(msg, "master chief dev ultraboop") ||
        Tools.msg_starts(msg, "ultraboop")) {
			if ((await app.modules).dev_commands.auth_dev_master(msg.author.id) && !msg.mentions.everyone && msg.mentions.users.array().length === 1) {
				const user = msg.mentions.users.array()[0];

				if ((await app.modules).discord.check_self(user.id)) {
					return selfDevBoop(msg);
				}

				return devboop(msg, user);
			} else {
				return devbooprejection(msg);
			}
		}
	}

	async function boop(msg, user) {
		setTimeout(() => msg.delete(), app_config.deleteDelay);

		const random = Tools.getRandomIntFromInterval(0, config.boopAnswer.length - 1);
		msg.channel.send(Tools.parseReply(config.boopAnswer[random], [user])).then(message => {
			message.delete({ timeout: boopDeleteTimeout });
		});

		(await app.modules).overload.overload("boop");
		(await app.modules).discord.set_message_sent();
	}

	async function selfBoop(msg) {
		if (Tools.chancePercent(5)) {
			const random = Tools.getRandomIntFromInterval(0, config.selfBoopAnswer.length - 1);
			const answer = Tools.parseReply(config.selfBoopAnswer[random], [(await app.modules).discord.get_emoji("gc_canniexcited")]);
			msg.channel.send(answer).then(message => {
				message.delete({ timeout: boopDeleteTimeout });
			});
		} else {
			const random = Tools.getRandomIntFromInterval(0, config.canniBoopAnswer.length - 1);
			const answer = Tools.parseReply(config.canniBoopAnswer[random], [msg.author, (await app.modules).discord.get_emoji("gc_cannishy")]);
			msg.channel.send(answer).then(message => {
				message.delete({ timeout: boopDeleteTimeout });
			});
		}

		setTimeout(() => msg.delete(), app_config.deleteDelay);

		(await app.modules).overload.overload("boop");
		(await app.modules).discord.set_message_sent();
	}

	async function wachmannBoop(msg, user) {
		const guard_cooldown_message = Tools.parseReply(config.ans_boop_guard_cooldown);
		if ((await app.modules).discord.control_talked_recently(msg, config.boop_guard_type, true, "channel", guard_cooldown_message, undefined, 120000)) {
			boop(msg, user);
		}
	}

	function megaBoopLoader(msg, user) {
		const roll = Tools.getRandomIntFromInterval(0, 100);

		if (roll === 100) {
			hyperBoop(msg, user);
		} else if (roll >= 0 && roll <= 5) {
			megaBoop(msg, user, "miss");
		} else if (roll >= 90 && roll <= 99) {
			megaBoop(msg, user, "crit");
		} else {
			megaBoop(msg, user);
		}
	}

	async function megaBoop(msg, user, type = "hit") {
		let random, damage, answer = [], limit;
		interrupt.inter = false;
		switch (type) {
		case "miss":
			random = Tools.getRandomIntFromInterval(0, config.megaBoopMissAnswer.length - 1);
			answer = config.megaBoopMissAnswer[random];
			limit = 20;
			break;
		case "crit":
			random = Tools.getRandomIntFromInterval(0, config.megaBoopCritAnswer.length - 1);
			damage = Tools.getRandomIntFromInterval(13500, 18000);
			answer = config.megaBoopCritAnswer[random];
			limit = 90;
			break;
		default:
			random = Tools.getRandomIntFromInterval(0, config.megaBoopAnswer.length - 1);
			damage = Tools.getRandomIntFromInterval(9000, 12000);
			answer = config.megaBoopAnswer[random];
			limit = 60;
			break;
		}

		answer = statusgenerator(answer, limit, type === "miss");

		let init_delay = 1000;
		let delay = 3000;

		if ((await app.modules).dev_commands.auth_dev(msg.author.id)) {
			init_delay += 1000;
			delay += 2000;
		}

		counterWindow(delay + init_delay);
		setTimeout(function() {
			if (Array.isArray(answer)) {
				Tools.listSender(msg.channel, answer, [delay, 2000, 1000], [user, damage], interrupt);
			} else {
				msg.channel.send(Tools.parseReply(answer, [user, damage]));
			}
		}, init_delay);

		(await app.modules).discord.set_message_sent();
	}

	async function megaSelfBoop(msg) {
		const random = Tools.getRandomIntFromInterval(0, config.megaSelfBoopAnswer.length - 1);
		msg.channel.send(Tools.parseReply(config.megaSelfBoopAnswer[random], [msg.author, Application.modules.Discord.getEmoji("gc_cannihello")]));

		(await app.modules).overload.overload("boop");
		(await app.modules).discord.set_message_sent();
	}

	async function hyperBoop(msg, user) {
		const random = Tools.getRandomIntFromInterval(0, config.hyperBoopAnswer.length - 1);
		const ans = config.hyperBoopAnswer[random];
		if (Array.isArray(ans)) {
			Tools.listSender(msg.channel, ans, [1000, 2000, 4000, 4000, 2000, 2000, 2000, 2000, 3000], [user]);
		} else {
			msg.channel.send(Tools.parseReply(ans, [user]));
		}

		(await app.modules).discord.set_message_sent();
	}

	async function devbooprejection(msg) {
		if ((await app.modules).discord.control_talked_recently(msg, config.dev_ultra_boop_rejection_type, false, "message")) {
			const random = Tools.getRandomIntFromInterval(0, config.dev_ultra_boop_rejection.length - 1);
			msg.channel.send(Tools.parseReply(config.dev_ultra_boop_rejection[random], [msg.author]));
		}

		(await app.modules).discord.set_message_sent();
	}

	async function selfDevBoop(msg) {
		const random = Tools.getRandomIntFromInterval(0, config.dev_self_boop.length - 1);
		msg.channel.send(Tools.parseReply(config.dev_self_boop[random], [msg.author]));

		(await app.modules).discord.set_message_sent();
	}

	async function devboop(msg, user) {
		boop_dev_on = false;
		const random = Tools.getRandomIntFromInterval(0, config.dev_ultra_boop.length - 1);
		const ans = config.dev_ultra_boop[random];
		const delay = [2000, 3000, 3000, 3000, 3000, 15000, 15000, 15000, 13000, 2000, 3000, 3000, 3000, 5000];
		const delay2 = 2000;
		if (Array.isArray(ans)) {
			Tools.listSender(msg.channel, ans, delay, [user]).then(() => {
				setTimeout(function() {
					msg.channel.send(Tools.parseReply(config.dev_ultra_boop_impact, [user]), { files:[path] }).then(function() {
						boop_dev_on = true;
						msg.channel.send(Tools.parseReply(config.dev_ultra_boop_postimpact));
					});
				}, delay2);
			});

		} else {
			msg.channel.send(Tools.parseReply(ans, [user]));
		}

		(await app.modules).discord.set_message_sent();
	}


	async function counter(msg, type_pre) {
		interrupt.inter = true;
		let ans;
		let type;
		if (type_pre === "Block") {
			ans = config.megaBoopBlock;
			ans = statusgenerator(ans, 35);
			type = Tools.getRandomIntFromInterval(2000, 5000);
		} else {
			ans = config.megaBoopDevBlock;
			type = type_pre;
		}
		setTimeout(function() {
			Tools.listSender(msg.channel, ans, [2000], [msg.author, type]);
		}, 2000);
		(await app.modules).discord.set_message_sent();
	}

	function counterWindow(time) {
		this.megaon = true;
		setTimeout(function() {
			this.megaon = false;
		}.bind(this), time);
	}

	function statusgenerator(ans, limit, miss = false) {
		let res = [];

		if (Tools.chancePercent(limit)) {
			const template = miss ? config.status_effect_miss_template : config.status_effect_template;
			const random = Tools.getRandomIntFromInterval(0, config.status_effects.length - 1);
			const effect = config.status_effects[random];
			const add = Tools.parseReply(template, [effect]);

			let i;
			let len;
			for(i = 0, len = ans.length; i < len; ++i) {
				res[i] = ans[i];
			}
			res[i] = add;
		} else {
			res = ans;
		}

		return res;
	}

	async function setCooldown(msg, users) {
		const cooldownMessage = Tools.parseReply(config.cooldownMessage, [msg.author, (await app.modules).discord.get_emoji("gc_cannierror")]);

		if (!(await app.modules).discord.has_cooldown(msg.author.id, config.boopType)) {
			(await app.modules).discord.set_cooldown(msg.author.id, config.boopType, config.boopTimeout);
			(await app.modules).discord.send_cooldown_message(msg, msg.author.id + config.boopType, cooldownMessage, false);
			mi.logger.info(`${msg.author} added to boop cooldown list.`);

			const no_command_users = users.filter(u => !Tools.allows_command_use(u));
			const word = no_command_users.length === 1 ? no_command_users[0].toString()
				: no_command_users.length === 2 ? no_command_users.map(u => u.toString()).join(" and ")
					: no_command_users.length > 2 ? no_command_users.map(u => u.toString()).slice(0, -1).join(", ") + ", and " + no_command_users.slice(-1).toString()
						: false;
			if (!word) return;

			msg.channel.send(
				Tools.parseReply(config.command_use_not_allowed_cooldown_response, [word]),
				{ allowedMentions: { users: [] } }
			);
		}

		(await app.modules).discord.set_message_sent();
	}
});
