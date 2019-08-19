let currentStatus;

exports.init = function () {
    currentStatus = 0;
}

exports.publishStatus = async function (req, res) {
    res.send(String(currentStatus));
}

exports.increaseProgress = async function (progressIncrement) {
    if (progressIncrement <= 100) {
        currentStatus = progressIncrement;
    } else {
        currentStatus = 100;
    }
}
