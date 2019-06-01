const _ = require("lodash");
const log = require("./log");
const rp = require("request-promise");

const WTF_SONG_URL = "https://www.youtube.com/watch?v=k78OjoJZcVc";
const RESOURCE_PATH = "./res/";

const COMMAND_PREFIX = "!";

const commands = {
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
    },
    joke: {
        action: joke,
        description: "I know some funny stuff... !joke [target]"
    }
};

function handleCommands(client, message) {
    return Promise.resolve().then(() => {
        const commandRE = new RegExp("^" + "!" + "(\\w+)");
        const commandMatch = message.content.match(commandRE);
        if (!commandMatch) {
            return;
        }
        const commandStr = commandMatch.slice(1);
        const command = commands[commandStr];
        if (!command) {
            log.trace("Unknown command: " + commandStr);
            return;
        }
        return command.action(client, message);
    });
}

function help(client, message) {
    let content = "\n";
    _.forOwn(commands, function(command, name) {
        content += COMMAND_PREFIX + name + " - " + command.description + "\n";
    });
    return message.channel.send(content)
        .catch(function(err) {
            log.warn("help", err);
        });
}

function wakeUp(client, message) {
    if (client.user.status !== "online") {
        return client.user.setStatus("online")
            .then(function() {
                return message.channel.send("Ha! I knew you couldn't live without me!");
            })
            .catch(function(err) {
                log.warn("wakeUp", err);
            });
    }
}

function mute(client, message) {
    if (client.user.status !== "idle") {
        client.user.setStatus("idle")
            .then(function() {
                return message.channel.send("Hmph...");
            })
            .catch(function(err) {
                log.warn("mute", err);
            });
    }
}

function linkWTFSong(client, message) {
    return message.channel.send(WTF_SONG_URL)
    .catch(function(err) {
        log.warn("linkWTFSong", err);
    });
}

function playJussi(client, message) {
    return message.channel.send("Work in progress...")
        .catch(function(err) {
            log.warn("playJussi", err);
        });
    const voiceChannel = message.author.voiceChannel;
    if (!voiceChannel) {
        return message.channel.send("Join some voice channel first!")
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
    const high = 100;
    const low = 0;
    const parameters = message.content.split(" ");
    if ((parameters.length !== 3 && parameters.length !== 1) ||
        ((parameters.length === 3) && (parameters[2] < parameters[1]))) {
            return message.channel.send(commands.roll.description + ", you dumbo.")
                .catch(function(err) {
                    log.warn("roll", err.message);
                });
    }
    if (parameters.length === 3) {
        low = parseInt(parameters[1]);
        high = parseInt(parameters[2]);
    }
    const result = `${message.author.username} rolled ${Math.floor((Math.random() * high) + low)} (${low} - ${high})`;
    return message.channel.send(result)
        .catch(function() {
           log.warn("roll", err.message);
        });
}

function joke(client, message) {
    const jokeSubject = message.author.username;
    const parameters = message.content.split(" ");
    if (parameters.length > 1) {
        jokeSubject = parameters.slice(1).join(" ");
    }
    const options = {
        uri: "http://api.icndb.com/jokes/random?escape=javascript&limitTo=[explicit]&lastName=&firstName=" + jokeSubject
    };
    return rp(options)
        .then(function(response) {
            const responseJson = JSON.parse(response);
            if (responseJson.type !== "success") {
                throw new Error("Joke service failed");
            }
            return message.channel.send(responseJson.value.joke);
        })
        .catch(function(err) {
            log.warn("joke", err.message);
        });
}

module.exports = {
    handleCommands: handleCommands
};
