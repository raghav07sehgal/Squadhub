let connection = require('../../db/mediaDBConfig');

//Get all ibu information
exports.getAllTowerLocationInfo = function (req, res) {
    connection.query("SELECT * FROM towerlocation", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}


//Save ibu information
module.exports.saveTowerLocationInfo = function (req, res) {
    connection.query('INSERT INTO towerlocation SET ?', [req.body.towerLocationInfo], function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully submited!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully submited!!!!!" });
        }
    });
}

//Update ibu information
module.exports.updateTowerLocationInfo = function (req, res) {
    let towerLocationInfo = req.body.towerLocationInfo;
    let condition = { locationId: Number(towerLocationInfo.locationId) };
    let details = {
        'locationName': towerLocationInfo.locationName,
    }
    connection.query('UPDATE towerlocation SET ? WHERE ?', [details, condition], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully updated!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully updated!!!!!" });
        }
    })
}
