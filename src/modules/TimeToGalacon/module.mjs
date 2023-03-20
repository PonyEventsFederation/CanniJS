import { define_module } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";
import { Temporal } from "@js-temporal/polyfill";

import * as config from "../../config/TimeToGalacon.json" assert { type: "json" };

// Set to false in case GalaCon is cancelled.
const active = true;

export const time_to_galacon = define_module(async mi => {
	Application.modules.Discord.addCommand("when", (msg) => {
		handleWhen(msg);
	});

	Application.modules.Discord.client.on("message", (msg) => {
		handleMessage(msg);
	});

	const {
		berlin_tz,
		galaconDate,
		galaconInterval,
		local_tz
	} = initGalaconDate();

	return {
		stop
	};

	function handleWhen(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author)) {
			if (active) {
				return tellMeWhen(msg);
			} else {
				msg.channel.send("Currently not available...");
				Application.modules.Discord.setMessageSent();
			}
		}
	}

	function handleMessage(msg) {
		if (
			Application.modules.Discord.checkUserAccess(msg.author)
				&& msg.mentions.has(Application.modules.Discord.client.user)
		) {
			if (Tools.msg_contains(msg, "when is galacon")) {
				if (active) {
					return tellMeWhen(msg);
				} else {
					msg.channel.send("Currently not available...");
					Application.modules.Discord.setMessageSent();
				}
			}
		}
	}

	function initGalaconDate() {
		const [y, m, d] = config.galaconDate.split("-").map(n => Number.parseInt(n));
		const galaconDate = new Temporal.PlainDateTime(y, m, d);

		const berlin_tz = new Temporal.TimeZone("europe/berlin");
		const local_tz = Temporal.Now.timeZone();

		mi.logger.info("Set galacon date to " + galaconDate.toString({ smallestUnit: "minute" }));
		const galaconInterval = setInterval(
			() => updateGalaconDate(),
			(config.updateInterval || 10) * 1000
		);

		updateGalaconDate();

		return { galaconDate, berlin_tz, local_tz, galaconInterval };
	}

	function tellMeWhen(msg) {
		const duration = getTimeRemaining();
		const random = Tools.getRandomIntFromInterval(0, config.galaconAnswer.length - 1);

		msg.channel.send(Tools.parseReply(config.timeAnswer, [duration.days, duration.hrs, duration.minutes]) + "\n" + config.galaconAnswer[random]);

		Application.modules.Discord.setMessageSent();
	}

	function updateGalaconDate() {
		const duration = getTimeRemaining();
		const msg = `Time to Galacon: ${duration.days} days, ${duration.hrs}:${duration.minutes} left! Hype!`;

		Application.modules.Discord.client.user.setActivity(msg, {
			status: "online",
			afk: false
		}).then().catch(console.error);
	}

	function getTimeRemaining() {
		const local_zoned_gc_time = galaconDate
			.toZonedDateTime(berlin_tz)
			.withTimeZone(local_tz);

		const diff = local_zoned_gc_time.since(
			Temporal.Now.zonedDateTimeISO(),
			{ smallestUnit: "minute", largestUnit: "day" }
		);
		const { days, hours, minutes } = diff;

		return { days, hrs: hours, minutes };
	}

	async function stop() {
		clearInterval(galaconInterval);
	}
});

export default class CanniTimeToHype extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.addCommand("when", (msg) => {
				this.handleWhen(msg);
			});

			Application.modules.Discord.client.on("message", (msg) => {
				this.handleMessage(msg);
			});

			this.initGalaconDate();

			return resolve(this);
		});
	}

	handleWhen(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author)) {
			if (active) {
				return this.tellMeWhen(msg);
			} else {
				msg.channel.send("Currently not available...");
				Application.modules.Discord.setMessageSent();
			}
		}
	}

	handleMessage(msg) {
		if (
			Application.modules.Discord.checkUserAccess(msg.author)
				&& msg.mentions.has(Application.modules.Discord.client.user)
		) {
			if (Tools.msg_contains(msg, "when is galacon")) {
				if (active) {
					return this.tellMeWhen(msg);
				} else {
					msg.channel.send("Currently not available...");
					Application.modules.Discord.setMessageSent();
				}
			}
		}
	}

	initGalaconDate() {
		const [y, m, d] = this.config.galaconDate.split("-");
		this.galaconDate = new Temporal.PlainDateTime(y, m, d);

		this.berlin_tz = new Temporal.TimeZone("europe/berlin");
		this.local_tz = Temporal.Now.timeZone();

		this.log.info("Set galacon date to " + this.galaconDate.toString({ smallestUnit: "minute" }));
		this.galaconInterval = setInterval(
			() => this.updateGalaconDate(),
			(this.config.updateInterval || 10) * 1000
		);
		this.updateGalaconDate();
	}

	tellMeWhen(msg) {
		const duration = this.getTimeRemaining();
		const random = Tools.getRandomIntFromInterval(0, this.config.galaconAnswer.length - 1);

		msg.channel.send(Tools.parseReply(this.config.timeAnswer, [duration.days, duration.hrs, duration.minutes]) + "\n" + this.config.galaconAnswer[random]);

		Application.modules.Discord.setMessageSent();
	}

	updateGalaconDate() {
		const duration = this.getTimeRemaining();
		const msg = `Time to Galacon: ${duration.days} days, ${duration.hrs}:${duration.minutes} left! Hype!`;

		Application.modules.Discord.client.user.setActivity(msg, {
			status: "online",
			afk: false
		}).then().catch(console.error);
	}

	getTimeRemaining() {
		// @ts-expect-error
		const local_zoned_gc_time = this.galaconDate
			// @ts-expect-error
			.toZonedDateTime(this.berlin_tz)
			// @ts-expect-error
			.withTimeZone(this.local_tz);

		const diff = local_zoned_gc_time.since(
			Temporal.Now.zonedDateTimeISO(),
			{ smallestUnit: "minute", largestUnit: "day" }
		);
		const { days, hours, minutes } = diff;

		return { days, hrs: hours, minutes };
	}

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");

			clearInterval(this.galaconInterval);

			return resolve(this);
		});
	}
}
