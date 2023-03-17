import Application from "../../lib/Application.mjs";
import Module from "../../lib/Module.mjs";
import Promise from "bluebird";
import Tools from "../../lib/Tools.mjs";

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
