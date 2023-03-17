"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class UserJoined extends Module {
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
};
