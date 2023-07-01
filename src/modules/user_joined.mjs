import { define_module, stop } from "../lib/Module.mjs";
import * as app from "../lib/Application.mjs";
import Tools from "../lib/Tools.mjs";

const config = {
	general_channel_id: "602434888880095244",
	rules_channel_id: "602436162447212554",
	welcome_message: "( ͡° ͜ʖ (\\  *BOOPS* %s\nWelcome to the official GalaCon Discord server!\nBe sure to check out our <#%s>.",
	welcome_message_delay: 1000
};

export const user_joined = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	discord.client.on("guildMemberAdd", member => {
		mi.logger.debug(`member joined, guild ${member.guild.name} (id ${member.guild.id})`);

		const general_channel = member.guild.channels.resolve(config.general_channel_id);
		if (general_channel?.isText()) {
			setTimeout(() => {
				general_channel.send(Tools.parseReply(
					config.welcome_message,
					[member, config.rules_channel_id]
				));
			}, config.welcome_message_delay);
		}
	});

	return { stop };
});
