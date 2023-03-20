import { define_module, stop } from "../../lib/Module.mjs";
import Application from "../../lib/Application.mjs";
import * as app from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

import config from "../../config/UserJoined.json" assert { type: "json" };

export const user_joined = define_module(async mi => {
	(await app.modules).discord.client.on("guildMemberAdd", member => {
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

export default class UserJoined extends Module {
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("guildMemberAdd", member => {
				this.log.info("Member joined on guild " + member.guild.name);
				if (member.guild.channels.resolve(this.config.generalChannelId)) {
					setTimeout(() => {
						member.guild.channels.resolve(this.config.generalChannelId).send(
							Tools.parseReply(
								this.config.welcomeMessage,
								[member, this.config.rulesChannelId]
							));
					}, this.config.welcomeMessageDelay);
				}
			});

			return resolve(this);
		});
	}

	stop() {
		return new Promise(resolve => {
			this.log.debug("Stopping...");
			return resolve(this);
		});
	}
}
