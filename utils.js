function Utils () {
};

Utils.prototype.getTimestamp = function () {
    var now = new Date();
    return now.toString();
};

Utils.prototype.getSpotName = function (path, filename, duration) {

    var fs = require('fs');
    var files = fs.readdirSync(path);

    filename = filename.replace(".swf", "");
    
    if (files.length == 0) {
        return filename + duration + "seg.swf";
    }

    files = files.sort();

    var lastSpot = files[files.length - 1];
    // TODO: Sacar o novo nome
    // do spot para ficar no fim da playlist

    return filename + duration + "seg.swf";
};

module.exports = new Utils();

