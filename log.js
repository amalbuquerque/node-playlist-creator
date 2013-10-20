// para poder aceder ao config.folders.logs
var config = require('./config');

var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
        json: false,
        timestamp: true,
        level: config.log.level
    }),
    new (winston.transports.File)({ 
        filename: __dirname + '/' 
        + (config.folders.logs || 'logs') + '/' 
        + (config.log.logfile || 'debug.log'),
        json: false,
        maxsize: config.log.maxfilesize,
        level: config.log.level
    })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new (winston.transports.File)({
        filename: __dirname + '/'
        + (config.folders.logs || 'logs') + '/'
        + (config.log.exceptionsfile || 'exceptions.log'),
        json: false,
        maxsize: config.log.maxfilesize
    })
  ],
  exitOnError: false
});

module.exports = logger;

