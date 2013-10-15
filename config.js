var config = {}

config.folders = {};
config.playlist = {};
config.web = {};
config.log = {};

config.folders.spots = 'spots/Ericeira';
config.folders.scripts = 'scripts';
config.folders.logs = 'logs';

// tamanho em bytes
config.log.maxfilesize = 10 * 1000 * 1000;
config.log.logfile = 'debug.log';
config.log.exceptionsfile = 'exceptions.log';

config.playlist.pattern = /\d+seg\.swf$/;
config.playlist.timeunit = 'seg';
config.playlist.suffix = '.swf';

config.web.port = process.env.PORT || 3000;

module.exports = config;

