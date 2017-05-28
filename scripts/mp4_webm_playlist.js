var DEBUG = false;

$.getJSON( "ajax/get-mp4-playlist", function(data) {
    if (data) {
        log("Received: " + JSON.stringify(data));
        playPlaylist(data.outdoors);

        showPlaylist(data);
    }
}).fail(function() {
    log('ERROR: RefreshPlaylist Failed!!!');
    setTimeout('location.reload()', 20 * 1000);
});

function showPlaylist(data) {
    var outdoors = $.map(data.outdoors, function(outdoor) {
        o = outdoor.sources[0];
        return { source: o.src, type: o.type, duration: o.duration };
    });

    var toShow = {
        outdoors: outdoors,
        timestamp: data.playlist_generated
    };

    var prettyData = prettyPrint(toShow);
    $('#message').html(prettyData);
};

function playPlaylist(outdoors) {
    var player = videojs('my-video', { children: {loadSpinner: false} });
    var PLAYLIST_REPEATS = 3;

    player.playlist(outdoors);

    player.playlist.repeat(true);
    player.playlist.autoadvance(0);

    player.play();

    player.on('ended', function() {
        currentIndx = player.playlist.indexOf(this.currentSrc());
        if ((currentIndx + 1) == this.playlist().length) {
            log('Ended playing the playlist with this: ' + this.currentSrc());
        }
    });


    var setTimeoutFor  = -1;
    var spotsPlayed    = {};
    var playlistPlayed = 0;
    player.on('playlistitem', function() {
        if(Object.keys(spotsPlayed).length == player.playlist().length) {
            // we already played all spots at least once
            playlistPlayed += 1;
            log('Playlist was played ' + playlistPlayed + ' time(s).')

            if(playlistPlayed >= PLAYLIST_REPEATS) {
                location.reload();
            } else {
                spotsPlayed = {};
            }
        }
    });

    player.on('playing', function () {
        log('Now playing ' + this.currentSrc());
        var indexOf = player.playlist.currentItem();

        spotsPlayed[indexOf] = this.currentSrc();
        log('Playing ' + (indexOf+1) + ' of ' + player.playlist().length);
        duration = player.playlist()[indexOf].sources[0].duration;
        if (setTimeoutFor != indexOf) {
            log('Will play this for ' + duration + ' secs.')
            setTimeout(function() { player.playlist.next(); }, duration*1000);
            setTimeoutFor = indexOf;
        }
    });
};
