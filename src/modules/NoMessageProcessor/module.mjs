import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";

const config = {
	"playGameAnswer": "( ͡° ͜ʖ (\\  *BOOPS* %s. \nHey, I'm bored... Would you like to play a game with me? \nLet's play *%s*! \n\n %sI already picked! Now you pick:",
	"stillLearningAnswer": "I'm sorry, I don't understand what you're saying, I'm still learning. \nPlease don't be mad at me. %s",
	"randomBoopAnswer": "( ͡° ͜ʖ (\\  *BOOPS* %s. I'm bored!",
	"didNotPlayAnswer": "Oh... You don't want to play? That's fine too."
};

const remote_on = false;
const remote_target = null;

export const no_message_processor = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;
	let gamer_canni = await modules.gamer_canni;

	discord.client.on("message", async msg => {
		if (discord.check_user_access(msg.author)) {
			handle(msg);
		}
	});

	return {
		stop
	};

	async function handle(msg) {
		// When no message was sent, Canni either says she doesn't understand, or boops someone at random if she's not mentioned.
		if (msg.mentions.has(discord.client.user)) {
			if (!remote_on || remote_target !== msg.channel) {
				msg.channel.send(Tools.parseReply(config.stillLearningAnswer, [discord.get_emoji("gc_cannishy")]));
			}
		} else {
			const random = Tools.getRandomIntFromInterval(0, 500);
			if (random === 10) {
				msg.channel.send(Tools.parseReply(config.randomBoopAnswer, [msg.author]));
			}

			if (random === 42) {
				gamer_canni.letsPlay(msg, config.playGameAnswer);
			}
		}
	}
});
