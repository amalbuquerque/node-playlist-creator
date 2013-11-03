var logger = require('./log');
var fs = require('fs');

var replace1 = "{{replace:1}}";
var replace2 = "{{replace:2}}";

function SosHelper ( pathToSOSTemplate , resultPath , fileResult ) {
    this.templatePath = pathToSOSTemplate;
    this.resultPath = resultPath;
    this.fileResult = fileResult;

    this.createSOSWithPlaylist = function ( playlist ) {
        logger.info ('createSOS start');
        var templateContent = "";

        // 1. le o template
        templateContent = fs.readFileSync(this.templatePath, 'utf8');
        logger.info ('Read Template done');

        // 2. substitui em memoria o conteudo da playlist para os sitios certos
        if ( playlist && playlist.length > 0 && templateContent.length > 0 ) {
            logger.debug ('Starting replacing');
            var outdoorsToReplaceStr = JSON.stringify( playlist );
            logger.debug ('OutdoorsContent: ' + outdoorsToReplaceStr );
            var lastSpotTitle = playlist[ playlist.length - 1 ].title;

            templateContent = templateContent.replace( replace1, outdoorsToReplaceStr );
            templateContent = templateContent.replace( replace2, lastSpotTitle );
            logger.info ('SOS Template filled');

            logger.debug ( 'Template FinalContent: ' + templateContent );

            // 3. escrever o template preenchido para resultPath/sosresult.html
            var pathToWrite = this.resultPath + '/' + this.fileResult;

            fs.writeFileSync(pathToWrite, templateContent);
            logger.info('TemplateContent > ' + pathToWrite);

            /* 2013-11-02, AA: Era assync nao vale a pena
            fs.writeFile(pathToWrite, templateContent, function (err) {
                if (err) {
                    return logger.error(err);
                    // return console.log(err);
                }
                logger.info('TemplateContent > ' + pathToWrite);
                // console.log('TemplateContent > ' + pathToWrite);
            });
            */

            // 4. devolve resultPath/sosresult.html
            return pathToWrite;
        }
    };

};

module.exports = SosHelper;

