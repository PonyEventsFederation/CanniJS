"use strict";

// @IMPORTS
const Application = require("../lib/Application");
const Module = require("../lib/Module");
const moment = require("moment");
const Tools = require("../lib/Tools");
const { Temporal } = require("@js-temporal/polyfill");

// Set to false in case GalaCon is cancelled.
const active = true;

/** @extends { Module<import("./time-to-galacon-config.json")> } */
module.exports = class TimeToGalacon extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.addCommand("when", (msg) => {
				this.handleWhen(msg);
			});

			Application.modules.Discord.client.on("message", (msg) => {
				this.handleMessage(msg);
			});

			if (active) {
				Application.modules.Discord.client.on("ready", () => {
					// this.setGalaconDate();
					this.set_galacon_date2();
				});
			}

			return resolve(this);
		});
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
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

	/**
	 * @param { import("discord.js").Message } msg
	 */
	handleMessage(msg) {
		if (Application.modules.Discord.checkUserAccess(msg.author) && msg.mentions.has(Application.modules.Discord.client.user)) {
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

	setGalaconDate() {
		this.galaconDate = moment(this.config.galaconDate);
		this.log.info("Set galacon date to " + this.galaconDate.format());
		this.galaconInterval = setInterval(() => this.updateGalaconDate(), (this.config.updateInterval || 10) * 1000);
		this.updateGalaconDate();
	}

	set_galacon_date2() {
		const galacon_tz = new Temporal.TimeZone(this.config.galacon_date.time_zone);
		this.galacon_tz = galacon_tz;

		this.calendar = new Temporal.Calendar("gregory");

		const gc_date = Temporal.ZonedDateTime.from({
			timeZone: galacon_tz,
			calendar: this.calendar,
			year: this.config.galacon_date.year,
			month: this.config.galacon_date.month,
			day: this.config.galacon_date.day,
			hour: this.config.galacon_date.hour,
			minute: this.config.galacon_date.minute
		});
		this.galacon_date_2 = gc_date;

		this.galacon_date_2_instant = gc_date.toInstant();

		this.log.info("Set galacon date to " + this.galacon_date_2.toString());

		this.galaconInterval = setInterval(() => this.update_galacon_date2(), this.config.update_interval * 1000);
		this.update_galacon_date2();
	}

	update_galacon_date2() {
		// const until_galacon = Temporal.Now.instant()
		// 	.toZonedDateTime({
		// 		calendar: this.calendar,
		// 		timeZone: this.galacon_tz
		// 	})
		// 	.until(this.galacon_date_2);

		const until_galacon = Temporal.Now.instant()
			.until(this.galacon_date_2_instant)
			.round({ largestUnit: "day" });

		const msg = this.t("status", {
			days: until_galacon.days,
			hours: until_galacon.hours % 24,
			minutes: until_galacon.minutes
		});

		Application.modules.Discord.client.user.setPresence({
			status: "online",
			afk: false,
			activity: { name: msg }
		}).then().catch(console.error);
	}

	/**
	 * @param { import("discord.js").Message } msg
	 */
	tellMeWhen(msg) {
		const duration = this.getTimeRemaining();
		const random = Tools.getRandomIntFromInterval(0, this.config.galaconAnswer.length - 1);

		msg.channel.send(Tools.parseReply(
			this.config.timeAnswer,
			duration.days.toString(),
			duration.hrs,
			duration.minutes
		) + "\n" + this.config.galaconAnswer[random]);

		Application.modules.Discord.setMessageSent();
	}

	updateGalaconDate() {
		const duration = this.getTimeRemaining();
		const msg = `Time to Galacon: ${duration.days} days, ${duration.hrs}:${duration.minutes} left! Hype!`;

		Application.modules.Discord.client.user.setPresence({
			status: "online",
			afk: false,
			activity: { name: msg }
		}).then().catch(console.error);
	}

	getTimeRemaining() {
		// i dunno what's going on here
		// but it works so i'm not touching it :p ~vt

		const duration = this.galaconDate.diff(moment());
		// @ts-expect-error
		let seconds = parseInt(duration) / 1000;
		const days = Math.floor(seconds / (3600 * 24));
		seconds -= days * 3600 * 24;
		const hrs = Tools.padTime(Math.floor(seconds / 3600));
		// @ts-expect-error
		seconds -= hrs * 3600;
		const minutes = Tools.padTime(Math.floor(seconds / 60));
		// @ts-expect-error
		seconds -= minutes * 60;

		return {
			days, hrs, minutes, seconds
		};
	}

	/** @override */
	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");

			clearInterval(this.galaconInterval);

			return resolve(this);
		});
	}
};
