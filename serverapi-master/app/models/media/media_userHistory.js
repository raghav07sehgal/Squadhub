let connection = require('../../db/mediaDBConfig');

// Save user crud history
exports.saveUserHistory = function (userHistory) {
    connection.query('INSERT INTO userhistory SET ?', userHistory, function (error, results) {
        if (error) {
            console.log("error", error);
        }
    });
}

// Fetch user crud history
exports.getResourcesHistory = function (req, res) {
    connection.query("SELECT * FROM userhistory WHERE towerId=?", [req.body.towerId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}