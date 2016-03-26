/**
 * Created by jay on 25.3.2016.
 */

var bunyan = require("bunyan");

var LOG_FILE_PATH = "./handsome.log";
var log = bunyan.createLogger({
    name: "MrHandsome",
    streams: [
        {
            level: "debug",
            stream: process.stdout
        },
        {
            level: "warn",
            path: LOG_FILE_PATH
        }
    ]
});

module.exports = {
    trace: log.trace.bind(log),
    debug: log.debug.bind(log),
    info: log.info.bind(log),
    warn: log.warn.bind(log),
    error: log.error.bind(log)
};