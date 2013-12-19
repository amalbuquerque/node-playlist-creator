// thatsit-playlist: app.js
// setup
var config = require('./config');
var logger = require('./log');
var helper = require('./soshelper');
var myutils = require('./utils');

var util = require('util');
var express = require('express');
var fs = require('fs');
var path = require('path');
var engines = require('consolidate');

// 2013-11-02, AA: Utilizado para escrever o 
// sosresult.html apresentado em situacoes de
// falha do node.js
var soshelper = new helper ( 
    config.soshelper.templatePath,
    config.soshelper.resultPath,
    config.soshelper.filename
    );

var spotsPath = config.folders.spots;
var spotsRemoteFolder = 'spots';
var scriptsPath = config.folders.scripts;
var scriptsRemoteFolder = 'scripts';
var assetsPath = config.folders.assetsPath;
var assetsRemoteFolder = 'assets';

var app = express();
// 2013-12-18, AA: Para permitir os uploads
app.use(express.bodyParser());

var G_LASTREPLY = undefined;

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

// 2013-12-18, AA: Upload para permitir o save
// dos spots directamente
app.get('/upload-spot', function(req, res) {
    res.render('upload.html');
});

app.post('/ajax/upload-spot', function(req, res) {
    // logger.info(JSON.stringify(req.files, undefined, 2));
    logger.info('Received spot: ' + req.files.userSpot.name);

    var newSpotName = myutils.getSpotName('./' + spotsPath, req.files.userSpot.name, req.body.durationSpot);
    logger.info('New spot name: ' + newSpotName);

    var serverPathToMove = './' + spotsPath + '/' + newSpotName;

    var remotePath = '/' + spotsRemoteFolder + '/' + req.files.userSpot.name;
 
    logger.info('Moving ' + req.files.userSpot.path + ' to ' + serverPathToMove);

    fs.rename(
        req.files.userSpot.path,
        serverPathToMove,
        function(error) {
            if(error) {
                res.send({
                    error: 'Ah crap! Something bad happened'
                });
                return;
            }
     
            res.send({
                path: remotePath,
                filesystemPath: serverPathToMove
            });
    });
});

app.get('/ajax/get-info', function(req, res) {
    logger.info('Received params: ' + JSON.stringify(req.params));
    logger.info('Received query: ' + JSON.stringify(req.query));

    var reply = {}; 

    if ( G_LASTREPLY ) {
        reply = G_LASTREPLY;
    } else {
        reply.message = "ONLINE, didn't create any playlist yet.";
    }

    // var now = new Date();
    // reply.timestamp = now.toString();
    reply.info_timestamp = myutils.getTimestamp();

    var toreturn = util.format( "%s ( %j )", 
        req.query.callback, JSON.stringify(reply));

    res.send ( toreturn );
});

app.get('/ajax/get-playlist', function(req, res) {
    logger.info('GET /ajax/get-playlist');

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
        logger.debug('Checking file: ' + i + '; Name: ' + files[i]);

        var match = pattern.exec(files[i]);
        if (match) {
            var start = match.index;
            var text = match[0];
            var end = start + text.length;
        
            // console.log('I = ' + i);
            logger.debug('Matched file:' + files[i] + '; start: ' 
                + start + '; text:[' + text + ']; end: ' + end);
            var duration = text.slice(0, - (timeunit.length + suffix.length));
            logger.debug('With duration: ' + duration);
            reply.outdoors[outdoorIndex] = {
                title : files[i],
                // mantemos a compatibilidade com o codigo herdado
                type : "video",
                duration : duration };
            outdoorIndex++;
        }
        else {
            logger.debug('Not a XXseg.swf');
        }
    }
    // reply = 
        // { outdoors : [
                // { title : "abc.swf", duration : "15" },
                // { title : "news.swf", duration : "61" }
            // ]
        // };
    // 2013-11-02, AA: para criar uma playlist de recurso
    var sosResult = soshelper.createSOSWithPlaylist( reply.outdoors );
    var sosToRedirect = path.resolve(process.cwd(), sosResult);
    logger.info ('Wrote SOS to: ' + sosToRedirect);
    // OK: file:///C:/codigo/thatsit/spots/Ericeira/sosresult.html
    // returning: "C:\\codigo\\thatsit\\spots\\Ericeira\\sosresult.html" 
    // 2013-11-03, AA: E impossivel fazer o redirect para um localfile
    // portanto e irrelevante enviar o sosToRedirect
    sosToRedirect = sosToRedirect.replace(/\\/g, '/');
    sosToRedirect = 'file:///' + sosToRedirect;
    reply.sos = sosToRedirect;

    var msg = 'Returning ' + reply.outdoors.length + ' outdoors!';
    msg += 'Content: ' + JSON.stringify(reply);

    logger.info(msg);

    reply.playlist_generated = myutils.getTimestamp();

    // 2013-11-05, AA: Para podermos devolver no get-info a ultima
    // resposta devolvida pelo playlist-creator
    G_LASTREPLY = reply;

    res.json(reply);
});

app.on('error', function (err) {
  console.error(err);
  console.error(err.message);
  console.error(err.stack);
});

app.listen(config.web.port);
logger.info('Listening on port ' + config.web.port);
logger.info('Running on: ' + process.cwd());
