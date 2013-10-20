// setup
var config = require('./config');
var logger = require('./log');

var spotsPath = config.folders.spots;
var spotsRemoteFolder = 'spots';
var scriptsPath = config.folders.scripts;
var scriptsRemoteFolder = 'scripts';
var assetsPath = config.folders.assetsPath;
var assetsRemoteFolder = 'assets';

var express = require('express');
var fs = require('fs');

var app = express();

var engines = require('consolidate');

// pasta onde serao servidos os spots
app.use('/' + spotsRemoteFolder, express.static(__dirname + '/' + spotsPath));
// pasta onde serao servidos os scripts
app.use('/' + scriptsRemoteFolder, express.static(__dirname + '/' + scriptsPath));
// pasta onde serao servidos os diferentes assets (css, images, etc)
app.use('/' + assetsRemoteFolder, express.static(__dirname + '/' + assetsPath));

app.set('views', __dirname + '/views');
app.engine('html', engines.ejs);
app.set('view engine', 'html');
// app.set('html', require('ejs').renderFile);

// Forma sem express (apenas node.js)
app.get('/hello.txt', function(req, res) {
    var body = "Hello world without fancy express thing, I'm the ThatsIt Playlist Creator";
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', body.length);
    res.end(body);
});

// Forma com recurso ao express
app.get('/', function(req, res) {
    res.send("Hello world, I'm the ThatsIt Playlist Creator");
});

app.get('/geral', function(req, res) {
    res.render('geral.html');
});

app.get('/ajax/get-playlist', function(req, res) {
    logger.info('GET get-playlist');

    var files = fs.readdirSync('./' + spotsPath);

    // var pattern = /\d+seg\.swf$/;
    var pattern = config.playlist.pattern;
    var timeunit = config.playlist.timeunit;
    var suffix = config.playlist.suffix;

    var reply = { 
        spotsdir : spotsRemoteFolder,
        timestamp : undefined,
        outdoors : []
    };
    var outdoorIndex = 0;
    for (var i in files) {
        logger.info('Checking file: ' + i + '; Name: ' + files[i]);

        var match = pattern.exec(files[i]);
        if (match) {
            var start = match.index;
            var text = match[0];
            var end = start + text.length;
        
            // console.log('I = ' + i);
            logger.info('Matched file:' + files[i] + '; start: ' 
                + start + '; text:[' + text + ']; end: ' + end);
            var duration = text.slice(0, - (timeunit.length + suffix.length));
            logger.info('With duration: ' + duration);
            reply.outdoors[outdoorIndex] = {
                title : files[i],
                // mantemos a compatibilidade com o codigo herdado
                type : "video",
                duration : duration };
            outdoorIndex++;
        }
        else {
            logger.info('Not a XXseg.swf');
        }
    }
    // reply = 
        // { outdoors : [
                // { title : "abc.swf", duration : "15" },
                // { title : "news.swf", duration : "61" }
            // ]
        // };
    logger.info('Returning ' + reply.outdoors.length + ' outdoors!');
    logger.info('Content: ' + JSON.stringify(reply));

    var now = new Date();
    reply.timestamp = now.toString();
    res.json(reply);
});

app.listen(config.web.port);
logger.info('Listening on port ' + config.web.port);
logger.info('Running on: ' + process.cwd());
