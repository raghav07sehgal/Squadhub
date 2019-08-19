let connection = require('../../db/mediaDBConfig');

// Get tower info based on towerId
exports.getTowerInfo = function (req, res) {
    connection.query("SELECT * FROM tower WHERE towerId=?", [req.body.towerId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

// Get tower info
exports.getTowerList = function (req, res) {
    connection.query("SELECT * FROM tower", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}


//Get towers by ibuId
exports.getTowerInfoByIbuId = function (req, res) {
    connection.query("SELECT * FROM tower where ibuId in (select ibuId from tower where towerId=?) ORDER BY towerName ASC", [req.body.towerId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

//Save tower information
exports.saveTowerInfo = function (req, res) {
    connection.query('INSERT INTO tower SET ?', [req.body.towerInfo], function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully submited!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully submited!!!!!" });
        }
    });
}

//Update tower information
exports.updateTowerInfo = function (req, res) {
    let towerInfo = req.body.towerInfo;
    let condition = { towerId: Number(towerInfo.towerId) };
    let details = {
        'towerName': towerInfo.towerName,
        'ibuId': towerInfo.ibuId
    }
    connection.query('UPDATE tower SET ? WHERE ?', [details, condition], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully updated!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully updated!!!!!" });
        }
    })
}