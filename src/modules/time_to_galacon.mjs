import * as app from "../lib/Application.mjs";
import { define_module, stop } from "../lib/Module.mjs";
import Tools from "../lib/Tools.mjs";
import { Temporal } from "@js-temporal/polyfill";

const config = {
	time_answer: "There are %s days, %s hours, and %s minutes left until the next GalaCon!",
	galacon_answer: [
		"This is taking forever!",
		"Donate all your hard earned money bills!"
	],
	galacon_date: "2023-09-16",
	update_interval: 10
};

// Set to false in case GalaCon is cancelled.
const active = true;

export const time_to_galacon = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	// @ts-expect-error
	discord.add_command("when", (msg) => {
		handleWhen(msg);
	});

	discord.client.on("message", (msg) => {
		handleMessage(msg);
	});

	const {
		berlin_tz,
		galaconDate,
		local_tz
	} = initGalaconDate();

	await updateGalaconDate();
	const galaconInterval = setInterval(
		updateGalaconDate,
		(config.update_interval || 60) * 1000
	);

	return {
		stop
	};

	/**
	 * @param {import("discord.js").Message} msg
	 */
	function handleWhen(msg) {
		if (discord.check_user_access(msg.author)) {
			if (active) {
				return tellMeWhen(msg);
			} else {
				msg.channel.send("Currently not available...");
				discord.set_message_sent();
			}
		}
	}

	/**
	 * @param {import("discord.js").Message} msg
	 */
	function handleMessage(msg) {
		if (
			discord.check_user_access(msg.author)
				// @ts-expect-error
				&& msg.mentions.has(discord.client.user)
		) {
			if (Tools.msg_contains(msg, "when is galacon")) {
				if (active) {
					return tellMeWhen(msg);
				} else {
					msg.channel.send("Currently not available...");
					discord.set_message_sent();
				}
			}
		}
	}

	function initGalaconDate() {
		const [y, m, d] = config.galacon_date.split("-").map(n => Number.parseInt(n));
		const galaconDate = new Temporal.PlainDateTime(y, m, d);

		const berlin_tz = new Temporal.TimeZone("europe/berlin");
		const local_tz = Temporal.Now.timeZoneId();

		mi.logger.info("Set galacon date to " + galaconDate.toString({ smallestUnit: "minute" }));

		return { galaconDate, berlin_tz, local_tz };
	}

	/**
	 * @param {import("discord.js").Message} msg
	 */
	function tellMeWhen(msg) {
		const duration = getTimeRemaining();
		const random = Tools.getRandomIntFromInterval(0, config.galacon_answer.length - 1);

		msg.channel.send(Tools.parseReply(config.time_answer, [duration.days, duration.hrs, duration.minutes]) + "\n" + config.galacon_answer[random]);

		discord.set_message_sent();
	}

	async function updateGalaconDate() {
		const duration = getTimeRemaining();
		const msg = `Time to Galacon: ${duration.days} days, ${duration.hrs.toString().padStart(2, "0")}:${duration.minutes} left! Hype!`;

		// @ts-expect-error
		await discord.client.user.setActivity(msg, {
			// @ts-expect-error i dunno what this is h
			status: "online",
			afk: false
		});
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
