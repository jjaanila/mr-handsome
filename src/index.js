/**
 * Created by jay on 26.3.2016.
 */


var Promise = require("bluebird");
var Discord = require("discord.js");
var log = require("./log");
var eventHandlers = require("./eventHandlers");

var client = null;

function initialize() {
    client = new Discord.Client();
    eventHandlers.initEventHandlers(client);
}

function start() {
    var authDetails = require("../secure.json");
    client.login(authDetails.email, authDetails.password)
        .catch(function(err) {
            log.error("Login failed", err);
        });
}

initialize();
start();