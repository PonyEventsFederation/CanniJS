"use strict";

// TODO: clear commented out unused functions

const fs = require("fs");
// const moment = require("moment");
// const htmlEntities = require("html-entities");
// const striptags = require("striptags");

const Tools = {
	// getConfigValueByPath(config, path, defaultValue = null) {
	// 	const pathParts = path.split(".");
	// 	let currentConfig = JSON.parse(JSON.stringify(config));
	// 	let i;
	//
	// 	for (i = 0; i < pathParts.length; i++) {
	// 		const pathPart = pathParts[i];
	//
	// 		if (currentConfig[pathPart]) {
	// 			currentConfig = currentConfig[pathPart];
	// 		} else {
	// 			return defaultValue;
	// 		}
	// 	}
	//
	// 	return currentConfig;
	// },

	// getArrayDifferences(a, b) {
	// 	const diff = [];
	//
	// 	for (let i = 0; i < b.length; i++) {
	// 		const bval = b[i];
	// 		const aval = a[i];
	//
	// 		if (bval instanceof Object) {
	// 			for (const key in bval) {
	// 				if (aval instanceof Object) {
	// 					if (aval[key] != bval[key]) {
	// 						diff.push(bval);
	// 						break;
	// 					}
	// 				} else if (aval != bval[key]) {
	// 					diff.push(bval);
	// 					break;
	// 				}
	// 			}
	// 		} else if (aval != bval) {
	// 			diff.push(bval);
	// 			break;
	// 		}
	// 	}
	//
	// 	return diff;
	// },

	// escapeForRegexp(str, delimiter = "") {
	// 	if (!str) {
	// 		return "";
	// 	}
	//
	// 	str = str + "";
	// 	return (str + "").replace(new RegExp("[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\" + (delimiter) + "-]", "g"), "\\$&");
	// },

	/**
	 * @param { string } string
	 */
	capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	/**
	 * @param { string } path
	 */
	loadCommentedConfigFile(path) {
		try {
			return this.parseCommentedJson(fs.readFileSync(path, "utf8"));
		} catch (e) {
			const Application = require("./Application.js");
			Application.log.error("Error loading JSON " + path);
		}
	},

	/**
	 * @param { string } json
	 */
	parseCommentedJson(json) {
		return JSON.parse(this.minifyJson(json));
	},

	/**
	 * TODO: candidate for removal along with other commented json things,
	 * as it is never actually used
	 *
	 * @param { string } json
	 */
	minifyJson(json) {
		try {
			if (JSON.parse(json)) {
				return json;
			}
		} catch (e) {
			const Application = require("./Application.js");
			Application.log.error(e);
		}

		const tokenizer = /'|(\/\*)|(\*\/)|(\/\/)|\n|\r/g,
			new_str = [];
		let in_string = false,
			in_multiline_comment = false,
			in_singleline_comment = false,
			tmp, tmp2, ns = 0, from = 0, lc, rc;

		tokenizer.lastIndex = 0;

		// eslint-disable-next-line no-cond-assign
		while (tmp = tokenizer.exec(json)) {
			lc = RegExp.leftContext;
			rc = RegExp.rightContext;
			if (!in_multiline_comment && !in_singleline_comment) {
				tmp2 = lc.substring(from);
				if (!in_string) {
					tmp2 = tmp2.replace(/(\n|\r|\s)*/g, "");
				}
				new_str[ns++] = tmp2;
			}
			from = tokenizer.lastIndex;

			if (tmp[0] == "'" && !in_multiline_comment && !in_singleline_comment) {
				tmp2 = lc.match(/(\\)*$/);
				// start of string with ', or unescaped ' character found to end string
				if (!in_string || !tmp2 || (tmp2[0].length % 2) == 0) {
					in_string = !in_string;
				}
				// include ' character in next catch
				from--;
				rc = json.substring(from);
			} else if (tmp[0] == "/*" && !in_string && !in_multiline_comment && !in_singleline_comment) {
				in_multiline_comment = true;
			} else if (tmp[0] == "*/" && !in_string && in_multiline_comment && !in_singleline_comment) {
				in_multiline_comment = false;
			} else if (tmp[0] == "//" && !in_string && !in_multiline_comment && !in_singleline_comment) {
				in_singleline_comment = true;
			} else if ((tmp[0] == "\n" || tmp[0] == "\r") && !in_string && !in_multiline_comment && in_singleline_comment) {
				in_singleline_comment = false;
			} else if (!in_multiline_comment && !in_singleline_comment && !(/\n|\r|\s/.test(tmp[0]))) {
				new_str[ns++] = tmp[0];
			}
		}
		new_str[ns++] = rc;
		return new_str.join("");
	},

	// measureTime() {
	// 	const start = new Date().getTime();
	//
	// 	return () => {
	// 		const end = new Date().getTime();
	// 		return end - start;
	// 	};
	// },

	// escapeRegExp(str) {
	// 	return str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
	// },

	/**
	 * @param { string } str
	 * @param { number } width
	 */
	pad(str, width) {
		const len = Math.max(0, width - String(str).length);
		return str + Array(len + 1).join(" ");
	},

	/**
	 * @param { number } num
	 */
	padTime(num) {
		if (String(num).length == 2) {
			return String(num);
		}

		return "0" + String(num);
	},

	// isNumber(val) {
	// 	return /^[.0-9]+$/.test(String(val));
	// },

	// formatDuration(duration) {
	// 	// don't forget the second param
	// 	const sec_num = parseInt(duration / 1000, 10);
	// 	let hours = Math.floor(sec_num / 3600);
	// 	let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	// 	let seconds = sec_num - (hours * 3600) - (minutes * 60);
	//
	// 	if (hours < 10) {
	// 		hours = "0" + hours;
	// 	}
	// 	if (minutes < 10) {
	// 		minutes = "0" + minutes;
	// 	}
	// 	if (seconds < 10) {
	// 		seconds = "0" + seconds;
	// 	}
	// 	return hours + ":" + minutes + ":" + seconds;
	// },

	// toPrecision(value, precision = 0) {
	// 	const power = Math.pow(10, precision);
	// 	const absValue = Math.abs(Math.round(value * power));
	// 	let result = (value < 0 ? "-" : "") + String(Math.floor(absValue / power));
	//
	// 	if (precision > 0) {
	// 		const fraction = String(absValue % power);
	// 		const padding = new Array(Math.max(precision - fraction.length, 0) + 1).join("0");
	// 		result += "." + padding + fraction;
	// 	}
	//
	// 	return result;
	// },

	// isInDate(start, end) {
	// 	if (end.unix() === -3600 || end.unix() === 0) {
	// 		end = moment(new Date("INVALID DATE"));
	// 	}
	// 	if (start.unix() === -3600 || start.unix() === 0) {
	// 		start = moment(new Date("INVALID DATE"));
	// 	}
	//
	// 	if (start.isValid() && end.isValid()) {
	// 		return start.isBefore() && end.isAfter();
	// 	} else if (start.isValid()) {
	// 		return start.isBefore();
	// 	} else if (end.isValid()) {
	// 		return end.isAfter();
	// 	}
	// 	return true;
	// },

	// escapeForCDATA(val, keeptags = []) {
	// 	if (!val) {
	// 		return val;
	// 	}
	//
	// 	if (typeof val !== "string") {
	// 		val = val.toString();
	// 	}
	//
	// 	val = htmlEntities.decode(val);
	//
	// 	if (keeptags === true) {
	// 		return val;
	// 	}
	//
	// 	return striptags(val, keeptags);
	// },

	/**
	 * @param { string } str
	 * @param { Array<string> } args
	 */
	parseReply(str, ...args) {
		let i = 0;
		args = args.flat();
		return str.replace(/%s/g, () => args[i++]);
	},

	/**
	 * @param { number } min
	 * @param { number } max
	 */
	getRandomIntFromInterval(min, max, precise = false) {
		if (precise) {
			return Math.random() * (max - min + 1) + min;
		}
		return Math.floor(Math.random() * (max - min + 1) + min);
	},

	/**
	 * @param { number } min
	 * @param { number } max
	 */
	rand_float_from_interval2(min, max) {
		return (Math.random() * (max - min)) + min;
	},

	/**
	 * @param { number } min
	 * @param { number } max
	 */
	rand_int_inclusive_from_interval2(min, max) {
		return Math.floor(this.rand_float_from_interval2(min, max + 1));
	},

	/**
	 * @param { number } limit
	 */
	chancePercent(limit, precise = false) {
		return (Tools.getRandomIntFromInterval(0, 100, precise) <= limit);
	},

	/**
	 * @param { string } str
	 * @param { string } word
	 */
	strContainsWord(str, word) {
		str = str.replace(/[!'#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, "");
		str = str.toLowerCase();
		const wrd = word.toLowerCase();
		const wrdArray = str.split(" ");

		for (let i = 0; i < wrdArray.length; i++) {
			if (wrd === wrdArray[i]) {
				return true;
			}
		}

		return false;
	},

	/**
	 * @param { string } str
	 * @param { string } word
	 */
	strStartsWord(str, word) {
		const matches = str.match(/^([\w-]+)/g);
		return (matches?.[0]?.toLowerCase() === word.toLowerCase());
	},

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { string } text
	 */
	msg_contains(msg, text) {
		return msg.content.toLowerCase().includes(text.toLowerCase());
	},

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { Array<string> } list
	 */
	msg_contains_list(msg, list) {
		let cond = false;
		const msg_contains = this.msg_contains;
		list.forEach(function(item) {
			if (msg_contains(msg, item)) cond = true;
		});
		return cond;
	},

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { Array<string> } list
	 */
	msg_contains_word_list(msg, list) {
		let cond = false;
		const str = msg.content;
		const strContainsWord = this.strContainsWord;
		list.forEach(function(item) {
			if (strContainsWord(str, item)) cond = true;
		});
		return cond;
	},

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { string } text
	 */
	msg_starts(msg, text) {
		return msg.content.toLowerCase().startsWith(text.toLowerCase());
	},

	/**
	 * @param { import("discord.js").Message } msg
	 * @param { string } text
	 */
	msg_starts_mentioned(msg, text) {
		const content = msg.content.toLowerCase().split(">")[1];
		if (content[0] === " ") {
			if (content[1] === " ") {
				return content.substring(2).startsWith(text);
			}
			return content.substring(1).startsWith(text);
		}
		return content.startsWith(text);
	},

	/**
	 * @param { string } mention
	 */
	get_id_from_mention(mention) {
		const tmp = mention.toString().replace(/\s/g, "");
		return tmp.substring(2, tmp.length - 1);
	},

	/**
	 * TODO: duplicate method with Discord::getEmoji, remove this
	 *
	 * @param { import("discord.js").Client } client
	 * @param { string } type
	 */
	getEmoji(client, type) {
		const foundEmoji = client.emojis.cache.find(emoji => emoji.name.toLowerCase() === type.toLowerCase());

		if (foundEmoji) {
			return foundEmoji;
		}
		return "";
	},

	// emoji_parser(pre, client) {
	// 	const pre_list = pre.split(":");
	// 	let tmp = "";
	// 	let last_emo = false;
	// 	pre_list.filter(Boolean).forEach(function(item) {
	// 		if (item.includes(" ")) {
	// 			tmp += item + ":";
	// 			last_emo = false;
	// 		} else {
	// 			const emo = Tools.getEmoji(client, item);
	// 			if (emo === "") {
	// 				tmp += item + ":";
	// 				last_emo = false;
	// 			} else {
	// 				tmp = tmp.slice(0, -1);
	// 				tmp += emo;
	// 				last_emo = true;
	// 			}
	// 		}
	// 	});
	// 	if (!last_emo && pre[pre.length - 1] !== ":") {
	// 		tmp = tmp.slice(0, -1);
	// 	}
	// 	return tmp;
	// },

	// mention format <@name#number>
	// mention_parser(pre, guild) {
	// 	let tmp = "";
	// 	let tmp_pre = "";
	// 	let status = 0;
	// 	let content = "";
	//
	// 	[...pre].forEach(function(char) {
	// 		if (status === 0) {
	// 			if (char === "<") {
	// 				status = 1;
	// 				tmp += char;
	// 				content += tmp_pre;
	// 				tmp_pre = "";
	// 			} else {
	// 				tmp_pre += char;
	// 			}
	// 		} else if (status === 1) {
	// 			if (char === ">") {
	// 				const user = Tools.find_user_by_tag(guild, tmp.slice(2));
	// 				if (user !== null) {
	// 					status = 0;
	// 					content += user;
	// 					tmp = "";
	// 				} else {
	// 					status = 0;
	// 					content += tmp + char;
	// 					tmp = "";
	// 				}
	// 			} else {
	// 				tmp += char;
	// 			}
	// 		}
	// 	});
	// 	content += tmp_pre;
	// 	content += tmp;
	// 	return content;
	// },

	// find_user_by_tag(guild, tag) {
	// 	if (guild == null) {
	// 		return null;
	// 	}
	// 	const member = guild.members.fetch(tag);
	// 	return member.user;
	// },

	/**
	 * @param { import("discord.js").Guild } guild
	 * @param { string } id
	 */
	find_user_by_id(guild, id) {
		if (guild === null) {
			return null;
		}
		const member = guild.members.resolve(id);
		return member?.user;
	},

	/**
	 * @param { string } env
	 */
	test_ENV(env) {
		if (process.env[env]) {
			return true;
		} else {
			console.log("Warning no ENV variable called: " + env);
			return false;
		}
	},

	/**
	 * @param { import("discord.js").Client } client
	 * @param { string } id
	 */
	guild_by_id(client, id) {
		return client.guilds.resolve(id);
	},

	// loadFile(path) {
	// 	try {
	// 		return fs.readFileSync(path);
	// 	} catch (e) {
	// 		const Application = require("./Application.js");
	// 		Application.log.error("Error loading File " + path);
	// 	}
	// },

	/**
	 * @param {
	 *    | import("discord.js").TextChannel
	 *    | import("discord.js").DMChannel
	 *    | import("discord.js").NewsChannel
	 * } target
	 * @param { Array<string> } data
	 * @param { Array<number> } delay_in
	 * @param { Array<string> } parse
	 * @param {{ inter: boolean }} interrupt
	 */
	listSender(target, data, delay_in, parse = [], interrupt = { inter: false }) {
		return new Promise(resolve => {
			/** @type { number } */
			let delay;
			if (delay_in.length === 1) {
				// @ts-expect-error this is kinda weird, but it works
				delay_in = delay_in[0];
			}
			if (Array.isArray(delay_in)) {
				delay = delay_in.shift();
			} else {
				delay = delay_in;
			}

			const pre = data[0];
			const count = (pre.match(/%s/g) || []).length;
			const content = Tools.parseReply(pre, ...parse.slice(0, count));
			if (!interrupt.inter) {
				if (content === "") {
					if (data.length > 1) {
						setTimeout(() => {
							Tools.listSender(target, data.slice(1), delay_in, parse.slice(count), interrupt)
								.then(resolve);
						}, delay);
					} else {
						resolve();
					}
				} else {
					target.send(content)
						.then(() => {
							if (data.length > 1) {
								setTimeout(() => {
									Tools.listSender(target, data.slice(1), delay_in, parse.slice(count), interrupt)
										.then(resolve);
								}, delay);
							} else {
								resolve();
							}
						});
				}
			} else {
				resolve();
			}
		});
	},

	/**
	 * @param { [month: number, day: number] } date
	 */
	check_date(date, range = 0) {
		// date = (month, day)
		const today = new Date();
		const month = today.getMonth() + 1;
		const day = today.getDate();

		if (date[0] === month) {
			if (day - range <= date[1] && date[1] <= day + range) {
				return true;
			}
		}

		return false;
	},

	/**
	 * @param { import("discord.js").GuildMember } member
	 */
	allows_command_use(member) {
		return !member.roles?.cache.get(process.env["NO_COMMAND_ROLE"] || "962689871305121813");
	}
};

module.exports = Tools;
