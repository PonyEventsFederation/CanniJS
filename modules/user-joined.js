"use strict";

// @IMPORTS
const Application = require("../lib/Application");
const Module = require("../lib/Module");
const Tools = require("../lib/Tools");

/** @extends { Module<import("./user-joined-config.json")> } */
module.exports = class UserJoined extends Module {
	/** @override */
	start() {
		return new Promise(resolve => {
			this.log.debug("Starting...");

			Application.modules.Discord.client.on("guildMemberAdd", member => {
				this.log.info("Member joined on guild " + member.guild.name);

				const channel = member.guild.channels.resolve(this.config.generalChannelId);
				if (channel && channel.isText()) {
					setTimeout(() => {
						channel.send(Tools.parseReply(
							this.config.welcomeMessage,
							member.toString(),
							this.config.rulesChannelId
						));
					}, this.config.welcomeMessageDelay);
				}
			});

			return resolve(this);
		});
	}
};
