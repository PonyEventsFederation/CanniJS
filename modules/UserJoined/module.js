"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Tools = require("../../lib/Tools");

/** @extends { Module<import("../../config/UserJoined.json")> } */
module.exports = class UserJoined extends Module {
	/** @override */
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
};
