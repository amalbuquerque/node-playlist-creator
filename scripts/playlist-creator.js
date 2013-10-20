var DEBUG = false;
var playlistPlayedCounter = 0;
// neste momento, faz reload da pagina no fim
// de passar a playlist pela 10 vez
var maxPlaylistTimesPlayed = 10;

var playlistPosition = 0;
var spotsDirectory = undefined;
var playlistFromDirectory = [];

$(document).ready(function(){
    $('#video').html('');
    // nao precisamos de reset
    // dado que acabamos de renderizar a pagina
    // resetGlobalVars();
    refreshPlaylist();
});

function resetGlobalVars(){
    playlistPosition = 0;
    spotsDirectory = undefined;
    playlistFromDirectory = [];
}

function updateInformationTitle(){
    $('#msg_header > h3')
        .text('Playlist received (Position: {0}/{1}, Playing {2}/{3}):'
        .format( playlistPosition+1,
            playlistFromDirectory.length,
            playlistPlayedCounter+1,
            maxPlaylistTimesPlayed ));
}

function updateInformation( data ){
    var prettyData = prettyPrint(data);
    $('#message').html(prettyData);
    updateInformationTitle();
}

function refreshPlaylist() {
    log('Start RefreshPlaylist');
    $.getJSON( "ajax/get-playlist", function( data ) {
        if (data) {
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
        // se nao tinha uma playlist previamente, tenta o refresh em 30 segundos
        // caso contrario, mostra a playlist que tinha carregada previamente
        log('ERROR: RefreshPlaylist Failed!!!');
        if (playlistFromDirectory.length === 0){
            setTimeout('refreshPlaylist()', 30 * 1000);
        } else {
            startPlaylistFromDirectory();
        }
    });
        
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
                nextStep = 'window.location.reload()';
            } else {
                // reset das vars e refresh apenas
                nextStep = 'resetGlobalVars();refreshPlaylist();';
            }
            setTimeout(nextStep, timeSpotPlayed);
        }
    }
}

