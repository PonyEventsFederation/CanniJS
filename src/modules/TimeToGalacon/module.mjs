import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
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
