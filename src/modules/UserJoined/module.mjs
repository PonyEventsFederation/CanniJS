import { define_module, stop } from "../../lib/Module.mjs";
import * as app from "../../lib/Application.mjs";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/UserJoined.json" assert { type: "json" };

export const user_joined = define_module(async mi => {
	const modules = await app.modules;
	const discord = await modules.discord;

	discord.client.on("guildMemberAdd", member => {
		mi.logger.debug(`member joined, guild ${member.guild.name} (id ${member.guild.id})`);

		const general_channel = member.guild.channels.resolve(config.generalChannelId);
		if (general_channel && general_channel.isText()) {
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
