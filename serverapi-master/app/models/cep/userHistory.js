var connection = require('../../db/cepDBConfig');

exports.saveUserHistory = function (userHistory) {
    connection.query('INSERT INTO user_history SET ?', userHistory, function (error, results) {
        if (error) {
            console.log("error", error);
        }
    });
}

exports.getResourcesHistory = function (req, res) {
    let sql = "";
    if (req.body.startDate && req.body.endDate) {
        sql = "SELECT * FROM user_history where joiningDate >='" + req.body.startDate + "' AND joiningDate <='" + req.body.endDate + "'";
    } else if (req.body.startDate) {
        sql = "SELECT * FROM user_history where joiningDate >='" + req.body.startDate + "'";
    } else if (req.body.endDate) {
        sql = "SELECT * FROM user_history where joiningDate <='" + req.body.endDate + "'";
    }
    connection.query(sql, function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}