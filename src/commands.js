/**
 * Created by jay on 26.3.2016.
 */

var _ = require("lodash");
var log = require("./log");

var COMMAND_PREFIX = "!";

var commands = {
    "help": {
        action: help,
        description: "Print help message"
    },
    "mute": {
        action: mute,
        description: "Mute me"
    },
    "wake": {
        action: wakeUp,
        description: "Wake me up"
    }

};

function handleCommands(client, message) {
    var commandRE = new RegExp("^" + COMMAND_PREFIX);
    if (!commandRE.test(message.content)) {
        return Promise.resolve();
    }
    var commandStr = message.content.slice(1);
    var command = commands[commandStr];
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
    return client.reply(message, content);
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

module.exports = {
    handleCommands: handleCommands
};