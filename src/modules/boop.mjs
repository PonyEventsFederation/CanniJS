import { define_module, stop } from "../lib/Module.mjs";
import * as app from "../lib/Application.mjs";
import app_config from "../config/application/config.json" assert { type: "json" };
import Database from "../lib/Database.mjs";
import Tools from "../lib/Tools.mjs";
import moment from "moment";
import { resolve as resolve_path } from "path";
const path = resolve_path("./src/data/impact.gif");
let boop_dev_on = true;
let wachmann_id;
const boopDeleteTimeout = 40000;

const config = {
	"boopAnswer": [
		"( ͡° ͜ʖ (\\  *BOOPS* %s"
	],
	"canniBoopAnswer": [
		"%s Nu-uh! Don't boop me... *boops back*. %s",
		"%s Canni is not for booping. %s"
	],
	"selfBoopAnswer": [
		"Teehee. Berry isn't looking~. %s\n*( ͡° ͜ʖ (\\ Canni quickly boops her own snoot.*"
	],
	"megaBoopAnswer": [
		[
			"All right! Get ready! Here comes my super powerful, and totally unblockable megaboop!",
			"Incoming!\n\n( ͡° ͜ʖ (\\  *MEGABOOPS* %s\n\n*Canni Bot's megaboop hits you for %s damage.*"
		]
	],
	"megaBoopMissAnswer": [
		[
			"All right! Get ready! Here comes my super powerful, and totally unblockable megaboop!",
			"Incoming!\n\n( ͡° ͜ʖ (\\  *MEGABOOPS* %s\n\n*Canni Bot's megaboop misses you.*",
			"Oh no, I missed!"
		]
	],
	"megaBoopCritAnswer": [
		[
			"All right! Get ready! Here comes my super powerful, and totally unblockable megaboop!",
			"Incoming!\n\n( ͡° ͜ʖ (\\  *MEGABOOPS* %s\n\n**Canni Bot's megaboop critically hits you for %s damage.**"
		]
	],
	"megaSelfBoopAnswer": [
		"%s I'm sorry, but I can't do that. \nMy creators added a failsafe so that I don't accidentally damage myself. %s"
	],
	"megaBoopDevBlock": ["**The ultimate Dev Megaboop Annihilation nullifies Canni Bot's megaboop!**","Hey... %s you can't just use your %s to counter my megaboop... Not fair..."],
	"megaBoopBlock": [
		"Incoming!\n\n( ͡° ͜ʖ (\\  *MEGABOOPS* %s\n\n**You block a part of the megaboop!**\n*Canni Bot's megaboop hits you now only for %s damage.*"
	],
	"hyperBoopAnswer": [
		[
			"All right! Get ready! Here comes my super powerful, and totally unblockable megaaaaaaaaaaaaaaa.............................",
			"**Warning!**",
			"Megaboop is overloading.",
			"Hypercharge has been activated!",
			"Converting power to execute **hyperboop**....","...","..",".",
			"Unleashing the ultimate **hyperboop**!",
			"Incoming!\n\n**( ͡° ͜ʖ (\\  *HYPERBOOPS*** %s \n\n**Canni Bot's hyperboop critically hits you for *infinite* damage.**"
		]
	],
	"cooldownMessage": "%s Oh my. I can't keep up with that many boops. You'll have to let me cool down for a bit! %s",
	"cooldownMessageMegaBoop": "%s Oh no! I can't let you megaboop another pony today. That would be far too dangerous!",
	"boopLimit": 3,
	"boopTimeout": 180000,
	"boopType": "boopType",
	"megaBoopType": "megaBoopType",
	"status_effects": [
		"Fanta!\nYou feel completely refreshed and re-energised! (Although you still received damage...)",
		"Super Fanta-stic!\nYou feel completely refreshed and re-energised! You are fully healed!",
		"Poison.\nYou feel a bit dizzy~~~",
		"Fire!\nHot, hot, hot! You are hot.",
		"Ice.\nYou are as cool as ice!",
		"Shock!\nYou are electrified! Stay away from electric appliances for a little while.",
		"Soaked.\nFor some reason you are soaked... How it happened remains a mystery.",
		"Glowing!\nYou are glowing in radiant white. But nothing happened...",
		"Radiation!\nYou are afflicted with a green glow. Is that... a third eye!?",
		"Petrification.\nYou rock!",
		"Gravity Change! You are 0.001g lighter!",
		"Confused...\nYou suddenly become very, *very* confused..........",
		"Amnesia!\nYou forgot about this status effect! .... Wait .... Which status effect? .... What is a status effect? ....",
		"Giga-Cheese-Cake-Rocket-Boat!!!\nThis status effect is self-explanatory.",
		"Des-Pear.\nYou want to eat a pear desperately!",
		"Brainwashed.\nYou brain has been taken to the laundry and is now squeaky clean!",
		"R-Age!\nFor the next 10 seconds you are so enraged that your age is high enough to watch R-rated films!",
		"Hungary.\nYou are hungry in Hungary!",
		"Sleepy.\nYou feel... very... sleepy... zzZZZ...",
		"Flying!\nYou can fly as long as you are falling! (Obviously...)",
		"Bouncy.\nYou are bouncy and you want to jump around.",
		"Invisible!\nThe other ponies can't see you!",
		"X-Ray Vision!\nYou can see through air!!! Isn't that incredible!",
		"Xray Version!\nThis is not X-Ray Vision! You are temporarily a version of Xray!",
		"Crystal.\nOoohhh... Shiny...",
		"Chris-tall\nThis is not Crystal! You are now as tall as Chris!",
		"Potato.\nYou are as smart as a sack of potatoes.",
		"Smartato!\nYou are as smart as Canni! (Take that as you will.)",
		"Error 404.\nStatus effect not found.",
		"Insomnia.\nI guess you don't need this effect. You are on this Server so you must have it already...",
		"Cannification!\nYou are turned into a nice and sweet bot!",
		"Bottification.\nYou are turned into a bot!",
		"Nugget!\nYou temporarily become a meme lord! A true connoisseur of the funny!",
		"Ponyfication.\nYou are turned into a pony!",
		"Mean Ponyfication.\nYou are turned into a pony! But not your OC. Muhahaha!!!",
		"MLP Ponyfication.\nCongratulations, you are a small horse!",
		"FiM Ponyfication.\nCongratulations, you are 2 dimensional!",
		"G5 Ponyfication.\nCongratulations, you have heart shaped hooves!",
		"Mango!\nBe aware: you are a Mango! Watch out for bat ponies.",
		"Galacon!\nYou want to come to Galacon! This status effect cannot be removed.",
		"Barrel Roll!\nDo a Barrel Roll!",
		"Stung.\nHow could the boop possibly have contained a mosquito?"
	],
	"status_effect_template": "*The megaboop gave you the following temporary status effect:\n\n%s*",
	"status_effect_miss_template": "*The megaboop missed but gave you a status effect anyway:\n\n%s*",
	"dev_ultra_boop_rejection": [
		"%s Silly you... You don't have the permission to do that...",
		"%s Oh no. Only my developers are authorised to do that."
	],
	"dev_ultra_boop": [
		[
			"Processing request...",
			"Authorisation as master dev successful!\n~~~~",
			"Full access granted!\n~~~~",
			"**Warning!**\nAll safety parameters disabled!\n~~~~",
			"Target locked!\nEvasion not possible!\n~~~~",
			"Initiating charging process.\nCompletion in 60 seconds.\n~~~~",
			"Charge at 25%",
			"Charge at 50%",
			"Charge at 75%",
			"Charge at 99%",
			"Charge at 100%\nApproaching critical mass!\n~~~~",
			"Ultraboop singularity has successfully been generated!\n~~~~",
			"Loading Master Chief Dev Ultraboop Cannon!\n~~~~",
			"Finalizing remaining prelaunch routines...\n~~~~",
			"Unleashing the ultimate, absolute, unstoppable **Master Chief Dev Ultraboop**!"
		]
	],
	"dev_ultra_boop_impact":"Incoming!\n\n( ͡° ͜ʖ (\\  *ULTRABOOPS* %s",
	"dev_ultra_boop_postimpact":"**Canni Bot's Master Chief Dev Ultraboop hits you for *infinite* damage.**",
	"dev_self_boop": ["%s\nWarning!\nThis operation can't be performed!"],
	"dev_ultra_boop_rejection_type":"dev_ultra_boop_rejection_type",
	"boop_guard_type": "boop_guard_type",
	"ans_boop_guard_cooldown": "I think he doesn't want to be disturbed right now...",
	"command_use_not_allowed_cooldown_response": "Also, I'm not allowed to boop %s..."
};

export const boop = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;
	const overload = await modules.overload;

	let boopCooldown = new Set();
	let messageSent = new Set();
	let interrupt = { inter: false };
	let megaon = false;

	if (Tools.test_ENV("WACHMANN_ID")) {
		wachmann_id = process.env["WACHMANN_ID"];
	}

	discord.client.on("message", msg => {
		if (discord.check_user_access(msg.author)) {
			mi.ignore_promise(handle(msg));
		}
	});

	return {
		stop
	};

	async function handle(msg) {
		if (Tools.strStartsWord(msg.content, "boop") && !msg.mentions.everyone && msg.mentions.users.array().length > 0) {
			const users = msg.mentions.members?.array() || [];

			if (users.length > config.boopLimit) {
				await setCooldown(msg, users);
			}

			if (!discord.has_cooldown(msg.author.id, config.boopType)) {
				await processBoops(msg, users);
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
			if (discord.check_self(users[i].id)) {
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
		if (discord.auth_dev(msg.author.id)) {
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
			if (discord.control_talked_recently(msg, config.megaBoopType, false, "message", undefined, undefined, blockTimeout)) {
				return counter(msg, "Block");
			}
		}
	}

	async function processMegaboops(msg) {
		if (Tools.strStartsWord(msg.content, "megaboop")) {
			if (!msg.mentions.everyone && msg.mentions.users.array().length === 1) {
				const user = msg.mentions.users.array()[0];
				if (discord.check_self(user.id)) {
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

				discord.set_message_sent();
			}
		}
	}

	async function processUltraBoops(msg) {
		if (Tools.msg_starts(msg, "master chief dev ultra boop") ||
        Tools.msg_starts(msg, "master chief dev ultraboop") ||
        Tools.msg_starts(msg, "ultraboop")) {
			if (discord.auth_dev_master(msg.author.id) && !msg.mentions.everyone && msg.mentions.users.array().length === 1) {
				const user = msg.mentions.users.array()[0];

				if (discord.check_self(user.id)) {
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

		overload.overload("boop");
		discord.set_message_sent();
	}

	async function selfBoop(msg) {
		if (Tools.chancePercent(5)) {
			const random = Tools.getRandomIntFromInterval(0, config.selfBoopAnswer.length - 1);
			const answer = Tools.parseReply(config.selfBoopAnswer[random], [discord.get_emoji("gc_canniexcited")]);
			msg.channel.send(answer).then(message => {
				message.delete({ timeout: boopDeleteTimeout });
			});
		} else {
			const random = Tools.getRandomIntFromInterval(0, config.canniBoopAnswer.length - 1);
			const answer = Tools.parseReply(config.canniBoopAnswer[random], [msg.author, discord.get_emoji("gc_cannishy")]);
			msg.channel.send(answer).then(message => {
				message.delete({ timeout: boopDeleteTimeout });
			});
		}

		setTimeout(() => msg.delete(), app_config.deleteDelay);

		overload.overload("boop");
		discord.set_message_sent();
	}

	async function wachmannBoop(msg, user) {
		const guard_cooldown_message = Tools.parseReply(config.ans_boop_guard_cooldown);
		if (discord.control_talked_recently(msg, config.boop_guard_type, true, "channel", guard_cooldown_message, undefined, 120000)) {
			boop(msg, user);
		}
	}

	async function megaBoopLoader(msg, user) {
		const roll = Tools.getRandomIntFromInterval(0, 100);

		if (roll === 100) {
			await hyperBoop(msg, user);
		} else if (roll >= 0 && roll <= 5) {
			await megaBoop(msg, user, "miss");
		} else if (roll >= 90 && roll <= 99) {
			await megaBoop(msg, user, "crit");
		} else {
			await megaBoop(msg, user);
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

		if (discord.auth_dev(msg.author.id)) {
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

		discord.set_message_sent();
	}

	async function megaSelfBoop(msg) {
		const random = Tools.getRandomIntFromInterval(0, config.megaSelfBoopAnswer.length - 1);
		msg.channel.send(Tools.parseReply(config.megaSelfBoopAnswer[random], [msg.author, discord.get_emoji("gc_cannihello")]));

		overload.overload("boop");
		discord.set_message_sent();
	}

	async function hyperBoop(msg, user) {
		const random = Tools.getRandomIntFromInterval(0, config.hyperBoopAnswer.length - 1);
		const ans = config.hyperBoopAnswer[random];
		if (Array.isArray(ans)) {
			Tools.listSender(msg.channel, ans, [1000, 2000, 4000, 4000, 2000, 2000, 2000, 2000, 3000], [user]);
		} else {
			msg.channel.send(Tools.parseReply(ans, [user]));
		}

		discord.set_message_sent();
	}

	async function devbooprejection(msg) {
		if (discord.control_talked_recently(msg, config.dev_ultra_boop_rejection_type, false, "message")) {
			const random = Tools.getRandomIntFromInterval(0, config.dev_ultra_boop_rejection.length - 1);
			msg.channel.send(Tools.parseReply(config.dev_ultra_boop_rejection[random], [msg.author]));
		}

		discord.set_message_sent();
	}

	async function selfDevBoop(msg) {
		const random = Tools.getRandomIntFromInterval(0, config.dev_self_boop.length - 1);
		msg.channel.send(Tools.parseReply(config.dev_self_boop[random], [msg.author]));

		discord.set_message_sent();
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

		discord.set_message_sent();
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
		discord.set_message_sent();
	}

	function counterWindow(time) {
		megaon = true;
		setTimeout(function() {
			megaon = false;
		}, time);
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
		const cooldownMessage = Tools.parseReply(config.cooldownMessage, [msg.author, discord.get_emoji("gc_cannierror")]);

		if (!discord.has_cooldown(msg.author.id, config.boopType)) {
			discord.set_cooldown(msg.author.id, config.boopType, config.boopTimeout);
			discord.send_cooldown_message(msg, msg.author.id + config.boopType, cooldownMessage, false);
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

		discord.set_message_sent();
	}
});
