// get an instance of the jira connector
let connection = require('../../db/mediaDBConfig');
let media_sendEmails = require('./media_sendEmails.js');

//Login management user
exports.managementUserLogin = function (req, res) {
    connection.query("SELECT * FROM managementusers where userName=? AND userPassword=?", [req.body.username, req.body.password], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

// Get management users info
exports.getManagementUsersList = function (req, res) {
    connection.query("SELECT * FROM managementusers", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

// Get management users info by towerId
exports.getManagementUsersListByTowerId = function (req, res) {
    connection.query("SELECT * FROM managementusers where towerId=?", [req.body.towerId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

//Save management user info
exports.saveManagementUserInfo = function (req, res) {
    connection.query('INSERT INTO managementusers SET ?', [req.body.managementUserInfo], function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully submited!!!!!" });
        } else {
            media_sendEmails.sendEmailManagementUserRegistration(req.body.managementUserInfo);
            res.json({ 'data': results, 'error': "data successfully submited!!!!!" });
        }
    });
}

// Update management user info
exports.updateManagementUserInfo = function (req, res) {
    let managementUserInfo = req.body.managementUserInfo;
    let condition = { userId: Number(managementUserInfo.userId) };
    let details = {
        'userFullName': managementUserInfo.userFullName,
        'userName': managementUserInfo.userName,
        'userEmail': managementUserInfo.userEmail,
        'userPassword': managementUserInfo.userPassword,
        'userRoll': managementUserInfo.userRoll,
        'userStatus': managementUserInfo.userStatus,
        'towerId': managementUserInfo.towerId,
    }
    connection.query('UPDATE managementusers SET ? WHERE ?', [details, condition], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully updated!!!!!" });
        } else {
            media_sendEmails.sendEmailManagementUserRegistration(req.body.managementUserInfo);
            res.json({ 'data': results, 'error': "data successfully updated!!!!!" });
        }
    })
}

// Get all user role list
exports.getAllUserRoleList = function (req, res) {
    connection.query("SELECT * FROM userrole", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}