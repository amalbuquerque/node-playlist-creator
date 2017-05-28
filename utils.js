function Utils () {
};

Utils.prototype.getTimestamp = function () {
    var now = new Date();
    return now.toString();
};

Utils.prototype.JSONstringify = function (obj) {
    // devolve o json indentado
    return JSON.stringify(obj, undefined, 2);
};


// var pattern = /\\.swf$/;
Utils.prototype.getSpotName = function (path, filename, duration, pattern) {

    var fs = require('fs');
    var p  = require('path');

    var files = fs.readdirSync(path);

    pattern = new RegExp("\\" + pattern + "$");

    var cont = 0;
    for (var i in files) {
        var match = pattern.exec(files[i]);
        if (match) {
            cont++;
        }
    }
    var file_index = cont + 1;

    extension = p.extname(filename);
    filename = filename.replace(extension, "");

    return file_index + "_" + filename + "_" + duration + "seg" + extension;
};

module.exports = new Utils();

