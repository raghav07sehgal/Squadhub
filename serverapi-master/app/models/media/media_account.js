let connection = require('../../db/mediaDBConfig');

//Get list of account
exports.getAccountsList = function (req, res) {
    connection.query("SELECT * FROM account ORDER BY accountName ASC", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

//Get list of account based on ibui
exports.getAccountsListByIbuId = function (req, res) {
    connection.query("SELECT * FROM account where ibuId=? ORDER BY accountName ASC", [req.body.ibuId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

//Get list of account based on ibui
exports.getAccountsListByTowerId = function (req, res) {
    connection.query("SELECT * FROM account where ibuId in (select ibuId from tower where towerId=?) ORDER BY accountName ASC", [req.body.towerId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

//Save account information
exports.saveAccountnfo = function (req, res) {
    connection.query('INSERT INTO account SET ?', [req.body.accountsInfo], function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully submited!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully submited!!!!!" });
        }
    });
}

//Update account information
exports.updateAccountInfo = function (req, res) {
    let accountsInfo = req.body.accountsInfo;
    let condition = { accountId: Number(accountsInfo.accountId) };
    let details = {
        'accountName': accountsInfo.accountName,
        'ibuId': accountsInfo.ibuId,
    }
    connection.query('UPDATE account SET ? WHERE ?', [details, condition], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully updated!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully updated!!!!!" });
        }
    })
}