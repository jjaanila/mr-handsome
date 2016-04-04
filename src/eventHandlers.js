var Promise = require("bluebird");
var _ = require("lodash");
var log = require("./log");
var commands = require("./commands");

var START_MUTE_TIME = 5000;  // 5 seconds
var RELOGIN_INTERVAL_TIME = 1000 * 60 * 30;  // 1/2 hour
var FLOOD_PREVENTION_TIME = 500; // 0.5 s

var reloginInterval = null;
var floodTimeout = null;

function getMainTextChannel(client) {
    return _.find(client.channels, function(channel) {
        return channel.type === "text";
    });
}

function initEventHandlers(client) {

    client.on("debug", function(message) {
        log.debug(message);
    });
    client.on("warn", function(message) {
        log.warn(message);
    });
    client.on("error", function(message) {
        log.error(message);
    });

    client.on("ready", function() {
        log.info("READY");
        client.setStatusIdle();
        setTimeout(function() {
            log.info("Unmuted after startup");
            client.setStatusActive();
            client.on("voiceJoin", function(voiceChannel, user) {
                return voiceJoinHandler(client, voiceChannel, user);
            });
        }, START_MUTE_TIME);
    });

    client.on("disconnected", function() {
        log.warn("Disconnected! Trying to relogin...");
        reloginInterval = setInterval(function() {
            var authDetails = require("../secure.json");
            return client.login(authDetails.email, authDetails.password)
                .then(function() {
                    log.info("Relogin successful");
                    clearInterval(reloginInterval);
                })
                .catch(function(err) {
                    log.error("Login failed", err);
                });
        }(), RELOGIN_INTERVAL_TIME);
        reloginInterval.unref();
    });

    client.on("message", function(message) {
        return commands.handleCommands(client, message);
    });
}

function voiceJoinHandler(client, voiceChannel, user) {
    if (client.user.status !== "online" ||
        floodTimeout !== null ||
        user.username === "Mr. Handsome") {return;}

    var textChannel = getMainTextChannel(client);
    if (!textChannel) {
        return;
    }
    var content = user.username + " now in " + voiceChannel.name;
    return client.sendMessage(textChannel, content, {tts: true})
        .then(function() {
            floodTimeout = setTimeout(function() {
                floodTimeout = null;
            }, FLOOD_PREVENTION_TIME);
        })
        .catch(function(err) {
            log.warn("voiceJoin: sendMessage failed", err);
        });
}



module.exports = {
    initEventHandlers: initEventHandlers
};