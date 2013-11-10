function Utils () {
};

Utils.prototype.getTimestamp = function () {
    var now = new Date();
    return now.toString();
};

module.exports = new Utils();

