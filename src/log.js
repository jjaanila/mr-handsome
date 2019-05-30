const bunyan = require("bunyan");

const log = bunyan.createLogger({
    name: "mr-handsome",
    streams: [
        {
            level: "info",
            stream: process.stdout
        },
    ]
});

module.exports = {
    trace: log.trace.bind(log),
    debug: log.debug.bind(log),
    info: log.info.bind(log),
    warn: log.warn.bind(log),
    error: log.error.bind(log)
};
