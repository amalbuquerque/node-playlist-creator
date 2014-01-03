// thatsit-playlist: app.js
// setup
var config = require('./config');
var logger = require('./log');
var helper = require('./soshelper');
var myutils = require('./utils');

var util = require('util');
var binary = require('binary');
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
// app.use(express.bodyParser());

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

// 2013-12-23, AA: faz o PUT do file no /xpti com sucesso
// tive de criar o content-length header a mao
app.get('/xpto', function(req, res) {
    var request = require("request");

    var input_path = './' + spotsPath + "/Fuel10seg.swf";
    fs.stat(input_path, function(err, stats) {
        fs.createReadStream(input_path)
        .pipe(request.put("http://localhost:3000/xpti",
            {
              headers : { 'content-length': stats.size }
            },
            function (error, response, body) {
                logger.info("Replied:", body);
            }
        ));
    });

    res.send("respond with something");
});

app.put('/xpti', function(request, response){
    var file = fs.createWriteStream('./' + spotsPath + "/received.txt");
    logger.info("HEADERS: ", request.headers);
    var fileSize = request.headers['content-length'];
    var uploadedSize = 0;

    request.on('data', function (chunk) {
        // logger.info("chunkSize: ", chunk.length, "filesize: ", fileSize);
        uploadedSize += chunk.length;
        uploadProgress = (uploadedSize/fileSize) * 100;
        response.write(Math.round(uploadProgress) + "%" + " uploaded\n" );
        /* request.pipe(file) trata disto!
        var bufferStore = file.write(chunk);
        if(bufferStore == false)
            request.pause();
        */
    });

    /* request.pipe(file) trata disto!
    file.on('drain', function() {
        request.resume();
    })
    */

    // The notion is quite similar to UNIX pipes.
    // Pipes the input into an output stream.
    request.pipe(file);

    request.on('end', function() {
        response.write('Upload done!');
        response.end();
    })
});

app.post('/api/upload-spot', express.bodyParser(), function(req, res){

    // logger.info("REQ.BODY:", util.inspect(req.body));
    logger.info("REQ.BODY:", req.body);

    var body = req.body.name;
    // 2013-12-22, AA: Nao pode ser assim, pq o default e utf-8
    // var buf = new Buffer(body, 'binary');
    var buf = new Buffer(body.toString('binary'), 'binary');

    console.log('req.body.name len:', body.length);
    console.log('buffer len:', buf.length);

    var g = binary.parse(buf)
        .word16bu('a') // unsigned 16-bit big-endian value
        .word16bu('b').vars;

    console.log('g.a', g.a);
    console.log('g.b', g.b);

    res.send("respond with a resource");
});

// 2013-12-18, AA: Upload para permitir o save
// dos spots directamente
app.get('/upload-spot', function(req, res) {
    res.render('upload.html');
});

// 2013-12-22, AA: podemos colocar o Parser (ou mais do que um)
// que devera ser utilizado no tratamento do request
app.post('/ajax/upload-spot', express.bodyParser(), function(req, res) {
    logger.info(myutils.JSONstringify(req.files));
    logger.info('Received spot: ' + req.files.userSpot.name);

    var newSpotName = myutils.getSpotName('./' + spotsPath,
        req.files.userSpot.name,
        req.body.durationSpot,
        config.playlist.suffix_pattern);

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
    logger.info('Received params: ' + myutils.JSONstringify(req.params));
    logger.info('Received query: ' + myutils.JSONstringify(req.query));

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
        req.query.callback, myutils.JSONstringify(reply));

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
    msg += 'Content: ' + myutils.JSONstringify(reply);

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
