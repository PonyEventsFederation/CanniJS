"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class RockPaperScissors extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            Application.modules.Discord.client.on('message', (msg) => {
                if (msg.author.bot) {
                    return;
                }

                if (Application.modules.Discord.isUserBlocked(msg.author.id)) {
                    return;
                }

                if (Application.modules.Discord.isMessageSent()) {
                    return;
                }

                if (msg.isMemberMentioned(Application.modules.Discord.client.user)) {
                    if (Tools.msg_contains(msg, 'let\'s play a game')) {
                        if (Application.modules.Discord.controlTalkedRecently(msg, this.config.playGameType)) {
                            return this.letsPlay(msg);
                        }
                    }
                }
            });

            return resolve(this);
        });
    }

    letsPlay(msg, flavourText = null) {
        this.log.info('started playing game');

        if (flavourText === null) {
            flavourText = this.config.playGameAnswer;
        }

        msg.channel.send(Tools.parseReply(flavourText, [msg.author, Application.modules.Discord.getEmoji('excited')])).then(sentEmbed => {
            sentEmbed.react('👊');

            setTimeout(() => {
                sentEmbed.react('🖐');
            }, 300);

            setTimeout(() => {
                sentEmbed.react('✌');
            }, 600);

            const filter = (reaction, user) => {
                return ['👊', '🖐', '✌'].includes(reaction.emoji.name) && user.id === msg.author.id;
            };

            sentEmbed.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] }).then(collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '👊') {
                    this.play(msg, 'rock');
                    this.log.info('User chose rock');
                } else if (reaction.emoji.name === '🖐') {
                    this.play(msg, 'paper');
                    this.log.info('User chose paper');
                } else {
                    this.play(msg, 'scissors');
                    this.log.info('User chose scissors');
                }
            }).catch(() => {
                this.log.info('User decided not to play');
                msg.reply(Tools.parseReply(this.config.didNotPlayAnswer, [Application.modules.Discord.getEmoji('shy')]));
            });
        });

        Application.modules.Discord.setMessageSent();
    }

    play(msg, userChoice) {
        let canniChoice = Math.random();
        let canni;
        if (canniChoice >= 0 && canniChoice <= 0.33) {
            canni = "rock";
        } else if (canniChoice >= 0.34 && canniChoice <= 0.66) {
            canni = "paper";
        } else {
            canni = "scissors";
        }

        const compare = (choice1, choice2) => {
            let result;

            if (choice1 === choice2) {
                result = 'tie';
            } else if (choice1 === "rock") {
                if (choice2 === "scissors") {
                    result = "playerWin";
                } else {
                    result = "canniWin";
                }
            } else if (choice1 === "paper") {
                if (choice2 === "rock") {
                    result = "playerWin";
                } else {
                    result = "canniWin";
                }
            } else if (choice1 === "scissors") {
                if (choice2 === "paper") {
                    result = "playerWin";
                } else {
                    result = "canniWin";
                }
            }

            return [result, choice2];
        };

        return this.resultMessage(msg, compare(userChoice, canni));
    }

    resultMessage(msg, result) {
        switch (result[0]) {
            case 'tie':
                msg.channel.send(Tools.parseReply(this.config.tieMessage, [msg.author, result[1], Application.modules.Discord.getEmoji('hello')]));
                break;
            case 'playerWin':
                msg.channel.send(Tools.parseReply(this.config.playerWinMessage, [msg.author, result[1], Application.modules.Discord.getEmoji('bizaam')]));
                break;
            case 'canniWin':
                msg.channel.send(Tools.parseReply(this.config.canniWinMessage, [msg.author, result[1], Application.modules.Discord.getEmoji('smile')]));
                break;
        }

        Application.modules.Discord.setMessageSent();
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};
