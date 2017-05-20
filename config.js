var config = {}

config.folders       = {};
config.folders.flash = {};

config.playlist       = {};
config.playlist.flash = {};

config.web       = {};
config.log       = {};
config.soshelper = {};

config.folders.flash.spots = '../../../spots_mafra';
config.folders.scripts = 'scripts';
// se fosse apenas config.folders.assets por alguma razao ficava undefined
config.folders.assetsPath = 'assets';
config.folders.logs = 'logs';

// tamanho em bytes
config.log.maxfilesize = 10 * 1000;
config.log.logfile = 'debug.log';
config.log.exceptionsfile = 'exceptions.log';
config.log.level = 'info';

config.playlist.timeunit = 'seg';

config.playlist.flash.pattern = /\d+seg\.swf$/;
config.playlist.flash.suffix_pattern = /\.swf$/;
config.playlist.flash.suffix = '.swf';

config.playlist.flash.pattern = /\d+seg\.swf$/;
config.playlist.flash.suffix_pattern = /\.swf$/;
config.playlist.flash.suffix = '.swf';

config.soshelper.flashTemplatePath = 'sos/flash_template.html';
// tem de ser a mesma pasta onde estao os spots
config.soshelper.resultPath = config.folders.flash.spots;
config.soshelper.filename = 'sosresult.html';

config.web.port = process.env.PORT || 3000;

module.exports = config;

