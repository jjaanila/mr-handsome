var _ = require("lodash");
var log = require("./log");
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));

var WTF_SONG_URL = "https://www.youtube.com/watch?v=k78OjoJZcVc";
var RESOURCE_PATH = "./res/";

var COMMAND_PREFIX = "!";

var commands = {
    help: {
        action: help,
        description: "Print help message"
    },
    mute: {
        action: mute,
        description: "Mute me"
    },
    wake: {
        action: wakeUp,
        description: "Wake me up"
    },
    wtf: {
        action: linkWTFSong,
        description: "So what's the big fucking deal?"
    },
    jth: {
        action: playJussi,
        description: "Kuka muu muka?"
    },
    roll: {
        action: roll,
        description: "Roll between two numbers. !roll <low> <high>"
    }
};

function handleCommands(client, message) {
    var commandRE = new RegExp("^" + "!" + "(\\w+)");
    var commandMatch = message.content.match(commandRE);
    if (!commandMatch) {
        return Promise.resolve();
    }
    var command = commands[commandMatch.slice(1)];
    if (!command) {
        log.trace("Unknown command: " + commandStr);
        return Promise.resolve();
    }
   return command.action(client, message);
}

function help(client, message) {
    var content = "\n";
    _.forOwn(commands, function(command, name) {
        content += COMMAND_PREFIX + name + " - " + command.description + "\n";
    });
    return client.reply(message, content)
        .catch(function(err) {
            log.warn("help", err);
        });
}

function wakeUp(client, message) {
    if (client.user.status !== "online") {
        client.setStatusActive()
            .then(function() {
                return client.reply(message, "Ha! I knew you couldn't live without me!");
            })
            .catch(function(err) {
                log.warn("wakeUp", err);
            });
    }
}

function mute(client, message) {
    if (client.user.status !== "idle") {
        client.setStatusIdle()
            .then(function() {
                return client.reply(message, "Hmph...");
            })
            .catch(function(err) {
                log.warn("mute", err);
            });
    }
}

function linkWTFSong(client, message) {
    return client.reply(message, WTF_SONG_URL)
    .catch(function(err) {
        log.warn("linkWTFSong", err);
    });
}

function playJussi(client, message) {
    return client.reply(message, "Work in progress...")
        .catch(function(err) {
            log.warn("playJussi", err);
        });
    var voiceChannel = message.author.voiceChannel;
    if (!voiceChannel) {
        return client.reply(message, "Join some voice channel first!")
            .catch(function(err) {
                log.warn("playJussi", err);
            });
    }
    return fs.accessAsync(RESOURCE_PATH + "example.mp3", fs.F_OK)
        .then(function() {
            return Promise.resolve(client.joinVoiceChannel(voiceChannel));
        })
        .then(function(voiceConnection) {
            return voiceConnection.playFile(RESOURCE_PATH + "example.mp3", {volume: 0.50});
        })
        .then(function(intent) {
            intent.on("end", function() {
                log.trace("playJussi", "playing ended");
                return client.leaveVoiceChannel()
                    .catch(function(err) {
                        log.warn("playJussi", "Tried to leave the voice channel but caused an error", err);
                    });
            });
            intent.on("error", function() {
                log.trace("playJussi", "playing error");
                return client.leaveVoiceChannel()
                    .catch(function(err) {
                        log.warn("playJussi", "Tried to leave the voice channel but caused an error", err);
                    });
            });
        })
        .catch(function(err) {
            log.warn("playJussi", err);
        });
}

function roll(client, message) {
    var high = 100;
    var low = 0;
    var parameters = message.content.split(" ");
    console.log(parameters);
    console.log(parameters.length);
    if ((parameters.length !== 3 && parameters.length !== 1) ||
        ((parameters.length === 3) && (parameters[2] < parameters[1]))) {
            return client.reply(message, commands.roll.description + ", you dumbo.")
                .catch(function(err) {
                    log.warn("roll", err);
                });
    }
    if (parameters.length === 3) {
        low = parseInt(parameters[1]);
        high = parseInt(parameters[2]);
    }
    var result = "rolled " + Math.floor((Math.random() * high) + low) + ". (" + low + " - " + high + ")";
    return client.reply(message, result)
        .catch(function() {
           log.warn("roll", err);
        });
}

module.exports = {
    handleCommands: handleCommands
};