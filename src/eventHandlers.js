const _ = require("lodash");
const log = require("./log");
const commands = require("./commands");
const settings = require("./settings");

const RELOGIN_INTERVAL_TIME = 1000 * 60 * 5;  // 5 minutes

const reloginInterval = null;

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
    });

    client.on("disconnected", function() {
        log.warn("Disconnected! Trying to relogin...");
        reloginInterval = setInterval(function() {
            return client.login(settings.discord.token, settings.discord.token)
                .then(function() {
                    log.info("Relogin successful");
                    clearInterval(reloginInterval);
                })
                .catch(function(err) {
                    log.error("Login failed", err);
                });
        }, RELOGIN_INTERVAL_TIME);
    });

    client.on("message", function(message) {
        if (message.author.id === client.user.id) {
            return;
        }
        return commands.handleCommands(client, message);
    });
}

module.exports = {
    initEventHandlers: initEventHandlers
};
