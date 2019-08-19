let connection = require('../../db/mediaDBConfig');

//Login super user
exports.superUserLogin = function (req, res) {
    connection.query("SELECT * FROM superuser where userName=? AND userPassword=?", [req.body.username, req.body.password], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

//Get super users details
exports.getSuperUserInfo = function (req, res) {
    connection.query("SELECT userType FROM superuser where userName=?", [req.body.userName], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

//Get super users details
exports.getSuperUserList = function (req, res) {
    connection.query("SELECT * FROM superuser", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

//Save new user
module.exports.saveSuperUserInfo = function (req, res) {
    connection.query('INSERT INTO superuser SET ?', req.body.superUserInfo, function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully submited!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully submited!!!!!" });
        }
    });
}

//Update user
module.exports.updationSuperUserInfo = function (req, res) {
    let userDetail = req.body.superUserInfo;
    let condition = { userId: Number(userDetail.userId) };
    let details = {
        'userFullName': userDetail.userFullName,
        'userName': userDetail.userName,
        'userPassword': userDetail.userPassword,
        'userType': userDetail.userType,
        'userStatus': userDetail.userStatus
    }
    connection.query('UPDATE superuser SET ? WHERE ?', [details, condition], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully updated!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully updated!!!!!" });
        }
    })
}
