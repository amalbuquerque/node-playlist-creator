var DEBUG = false;
var playlistPlayedCounter = 0;
// neste momento, faz reload da pagina no fim
// de passar a playlist pela 10 vez
var maxPlaylistTimesPlayed = 2;

var playlistPosition = 0;
var spotsDirectory = undefined;
var playlistFromDirectory = [];

// 2013-11-02, AA: sera para aqui que redirecciona
// no refreshPlaylist caso nao consiga obter a nova
// playlist, dado que o servidor estava em baixo
var urlPlaylistSOS = undefined;

$(document).ready(function(){
    $('#video').html('');
    // nao precisamos de reset
    // dado que acabamos de renderizar a pagina
    // resetGlobalVars();
    refreshPlaylist();
});

function resetGlobalVars(){
    log('resetGlobalVars() START');
    playlistPosition = 0;
    spotsDirectory = undefined;
    playlistFromDirectory = [];
    log('resetGlobalVars() END');
}

function updateInformationTitle(){
    $('#msg_header > h3')
        .text('Playlist received (Position: {0}/{1}, Playing {2}/{3}):'
        .format( playlistPosition+1,
            playlistFromDirectory.length,
            playlistPlayedCounter+1,
            maxPlaylistTimesPlayed ));
}

function updateSosURL( sosURL ) {
    if ( sosURL ) {
        $('#sos_header > h3 > a').attr("href", sosURL);
        $('#sos_header > h3 > a').text(sosURL);
    }
}

function updateInformation( data ){
    var prettyData = prettyPrint(data);
    $('#message').html(prettyData);
    updateInformationTitle();
    updateSosURL(data.sos);
}

// 2013-11-02, AA: failedBefore indica que
// esta chamada do refreshPlaylist ja falhou anteriormente
// pelo que nao deve fazer o refreshPlaylist
// mas sim passar ao plano B
function refreshPlaylist( failedBefore ) {
    log('RefreshPlaylist() START');
    $.getJSON( "ajax/get-playlist", function( data ) {
        if (data) {
            // 2013-11-02, AA: para redirect
            // se o server for abaixo
            urlPlaylistSOS = data.sos;
            updateInformation( data );

            if (data.spotsdir && spotsDirectory === undefined) {
                spotsDirectory = '/' + data.spotsdir;
            }
            if (data.outdoors && $.isArray(data.outdoors)) {
                log('Recebemos ' + data.outdoors.length + ' Outdoors.');
                // estava vazia a lista que recebemos,
                // tentamos dentro de 30 segs novamente
                if (data.outdoors.length === 0) {
                    setTimeout('refreshPlaylist()', 30 * 1000);
                } else {
                    // 2013-10-15, AA: Clonava o data.outdoors, nao e necessario
                    // playlistFromDirectory = $.extend(true, [], data.outdoors);
                    playlistFromDirectory = data.outdoors;
                    startPlaylistFromDirectory();
                }
            }
        }
    }).fail(function() {
        // tenta o refresh em 30 segundos, se ja tinha tentado anteriormente
        // mostra a playlist antiga no urlPlaylistSOS
        log('ERROR: RefreshPlaylist Failed!!!');

        // 2013-11-01, AA: Se o servidor nao responder
        // mostra o logo do background por agora
        $('#video').text('');

        if ( failedBefore && urlPlaylistSOS ) {
            // falhou e tem redirect SOS, passa para o redirect
            // alert (' Redirecting: ' + urlPlaylistSOS);
            location.href = urlPlaylistSOS;
            // 20131103, AA: para Google funciona, para localfile
            // e que nao (same domain policy)
            // location.href = '//www.google.pt';
        } else {
            // Daqui a 30 segs tenta novamente o refresh da playlist
            // com o failedBefore = true
            setTimeout('refreshPlaylist( true );', 30 * 1000);
        }
    });

    log('RefreshPlaylist() END');

};

function startPlaylistFromDirectory(){

    log('Start StartPlaylistFromDirectory');
    if (playlistFromDirectory.length === 0) {
        // caso nao tenhamos playlist ainda nao podemos fazer nada
        return;

    } else {

        var fileToPlay = playlistFromDirectory[playlistPosition].title;
        updateInformationTitle();
        fileToPlay = spotsDirectory + '/' + fileToPlay;
        log('Playing ' + fileToPlay);
        // flashembed("video", fileToPlay);

        // Fa um ajax GET antes, para ver
        // que o servidor consegue devolver o ficheiro
        var fileExists = checkIfExists( fileToPlay );
        if (fileExists === false) {
            // Se nao devolver, setTimeout com refresh da playlist daqui a 30 segundos
            // e return
            setTimeout('refreshPlaylist( true );', 30 * 1000);
            return;
        }

        $('#video').flashembed({
            src: fileToPlay, wmode: 'opaque'
        });

        var timeSpotPlayed =
            playlistFromDirectory[playlistPosition].duration * 1000;

        // se playlistPosition nao for a ultima, incrementamos para a proxima
        if(playlistPosition != (playlistFromDirectory.length - 1)){

            // so metemos timeout para o proximo spot
            // se nao for o ultimo
            log('Change spot in ' +
                timeSpotPlayed + ' secs');

            setTimeout('startPlaylistFromDirectory()', timeSpotPlayed);
            playlistPosition++;

        } else {

            // chegamos ao fim, fazemos refresh no fim deste spot
            playlistPlayedCounter++;

            var nextStep = '';
            if (playlistPlayedCounter === maxPlaylistTimesPlayed) {
                // faz reload
                // TODO: Se nao conseguir fazer reload, reverte para fallback
                nextStep = 'window.location.reload()';
            } else {
                // reset das vars e refresh apenas
                nextStep = 'resetGlobalVars();refreshPlaylist();';
            }
            setTimeout(nextStep, timeSpotPlayed);
        }
    }
}

