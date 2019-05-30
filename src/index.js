const Discord = require("discord.js");
const log = require("./log");
const eventHandlers = require("./eventHandlers");
const settings = require("./settings");

let client = null;

function initialize() {
    client = new Discord.Client();
    eventHandlers.initEventHandlers(client);

    process.on("unhandledRejection", function(err) {
        log.error("Unhandled rejection", err);
        throw err;
    });
}

function start() {
    return Promise.resolve().then(() => {
        if (!settings.discord.token) {
            throw new Error("settings.discord.token is missing!");
        }
        return client.login(settings.discord.token)
    })
    .catch(function(err) {
        log.error("Login failed", err);
    });
}

initialize();
start();
