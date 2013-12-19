$(document).ready(function() {
 
    status('Choose a file :)');
    // Check to see when a user has selected a file
    /*
     * 2013-12-18, AA:
    var timerId;
    timerId = setInterval(function() {

	if($('#spotInput').val() !== '') {
            clearInterval(timerId);
            $('#uploadForm').submit();
        }
    }, 500);
    */
 
    $('#uploadForm').submit(function() {
        status('uploading the file ...');
        
        $(this).ajaxSubmit({
            error: function(xhr) {
                status('Error: ' + xhr.status);
            },
     
            success: function(response) {
                if(response.error) {
                    status('Oops, something bad happened');
                    return;
                }

                var spotUrlPath = response.path;
                var spotUrlOnServer = response.filesystemPath;

                status('Success, spot uploaded to: ' + spotUrlPath
                    + '; On filesystem path: ' + spotUrlOnServer);

                // 2013-12-18, AA:
                // $('<img/>').attr('src', spotUrlOnServer).appendTo($('body'));
            }
        });
 
        // Have to stop the form from submitting and causing
        // a page refresh - don't forget this
        return false;
    });
 
    function status(message) {
        $('#status').text(message);
    }
});

