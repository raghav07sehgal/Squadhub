let connection = require('../../db/mediaDBConfig');

//Get all ibu information
exports.getAllIBUInfo = function (req, res) {
    connection.query("SELECT * FROM ibu", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

//Get all ibu information
exports.getAllIBUInfoByIbuId = function (req, res) {
    connection.query("SELECT * FROM ibu where ibuId in (select ibuId from tower where towerId=?)", [req.body.towerId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}


//Save ibu information
module.exports.saveIBUInfo = function (req, res) {
    connection.query('INSERT INTO ibu SET ?', [req.body.ibuInfo], function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully submited!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully submited!!!!!" });
        }
    });
}

//Update ibu information
module.exports.updateIBUInfo = function (req, res) {
    let ibuInfo = req.body.ibuInfo;
    let condition = { ibuId: Number(ibuInfo.ibuId) };
    let details = {
        'ibuName': ibuInfo.ibuName,
    }
    connection.query('UPDATE ibu SET ? WHERE ?', [details, condition], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully updated!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully updated!!!!!" });
        }
    })
}
