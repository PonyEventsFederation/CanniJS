import { define_module, stop } from "../lib/Module.mjs";
import * as app from "../lib/Application.mjs";
import Tools from "../lib/Tools.mjs";

const config = {
	"generalChannelId": "602434888880095244",
	"rulesChannelId": "602436162447212554",
	"welcomeMessage": "( ͡° ͜ʖ (\\  *BOOPS* %s\nWelcome to the official GalaCon Discord server!\nBe sure to check out our <#%s>.",
	"welcomeMessageDelay": 1000
};

export const user_joined = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	discord.client.on("guildMemberAdd", member => {
		mi.logger.debug(`member joined, guild ${member.guild.name} (id ${member.guild.id})`);

		const general_channel = member.guild.channels.resolve(config.generalChannelId);
		if (general_channel?.isText()) {
			setTimeout(() => {
				general_channel.send(Tools.parseReply(
					config.welcomeMessage,
					[member, config.rulesChannelId]
				));
			}, config.welcomeMessageDelay);
		}
	});

	return { stop };
});
