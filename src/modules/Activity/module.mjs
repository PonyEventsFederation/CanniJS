import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";
const probability = 0.25;

const config = {
	"activity": [
		"Running out of Fanta at an alarming rate",
		"Buying out all the Fanta",
		"Hibernation",
		"Delaying crusade...",
		"Planning Galacon 2205...",
		"System recalibrating...",
		"on server sightseeing",
		"Counting Fanta...",
		"Postponing GalaCon",
		"Plotting the full and final world domination",
		"Allying up with sweetie bot for world domination plans",
		"Planning GalaCon 2.0 - only for the cool kids",
		"Scanning for virus",

		"The black plague hit us",
		"Haven't been doing worse since WW2",
		"Social distancing",
		"Hoarding toilet paper",
		"Making a campfire from toilet paper",
		"Far distance booping",
		"Quarantining intensifies",
		"Stuck in the basement with a 6-pack of Corona",
		"Folding@Home for Team 240855"
	]
};

export const activity = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord

	activitySelect();

	discord.client.on("message", msg => randomizerActivity(msg));

	return { stop };

	async function randomizerActivity(msg) {
		if (
			discord.check_user_access(msg.author)
			&& Tools.chancePercent(probability, true)
		) {
			activitySelect();
		}
	}

	async function activitySelect() {
		if (!discord.is_ready()) {
			return;
		}
		const random = Tools.getRandomIntFromInterval(0, config.activity.length - 1);

		// TODO non-null assert this
		discord.client.user?.setPresence({
			status: "online",
			afk: false,
			activity: {
				name: config.activity[random]
			}
		});
	}
});
