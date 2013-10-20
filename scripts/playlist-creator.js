var playlistPosition = 0;
var spotsDirectory = undefined;
var playlistFromDirectory = [];

$(document).ready(function(){
    $('#video').html('');
    refreshPlaylist();
});

function refreshPlaylist() {
    console.log('Start RefreshPlaylist');
    $.getJSON( "ajax/get-playlist", function( data ) {
        if (data) {
            var prettyData = prettyPrint(data);
            $('#message').html(prettyData);

            if (data.spotsdir && spotsDirectory === undefined) {
                spotsDirectory = '/' + data.spotsdir;
            }
            if (data.outdoors && $.isArray(data.outdoors)) {
                console.log('Recebemos ' + data.outdoors.length + ' Outdoors.');
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
        console.log('ERROR: RefreshPlaylist Failed!!!');
        if (playlistFromDirectory.length === 0){
            setTimeout('refreshPlaylist()', 30 * 1000);
        } else {
            startPlaylistFromDirectory();
        }
    });
        
};

function startPlaylistFromDirectory(){

    console.log('Start StartPlaylistFromDirectory');
    if (playlistFromDirectory.length === 0) {
        // caso nao tenhamos playlist ainda nao podemos fazer nada
        return;

    } else {

        var fileToPlay = playlistFromDirectory[playlistPosition].title;
        fileToPlay = spotsDirectory + '/' + fileToPlay;
        console.log('Playing ' + fileToPlay);
        // flashembed("video", fileToPlay);

        $('#video').flashembed({
            src: fileToPlay, wmode: 'opaque'
        });

        setTimeout('startPlaylistFromDirectory()',
            playlistFromDirectory[playlistPosition].duration * 1000);

        // se playlistPosition nao for a ultima, incrementamos para a proxima
        if((playlistFromDirectory.length - 1) != playlistPosition){
            playlistPosition++;
        } else {
            // chegamos ao fim, fazemos refresh no fim deste spot
            setTimeout('window.location.reload()',
                    playlistFromDirectory[playlistPosition].duration * 1000);
        }
    }
}

