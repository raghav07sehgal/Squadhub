// get an instance of the jira connector
let connection = require('../../db/mediaDBConfig');
let cd_userHistory = require('./media_userHistory.js');

//Login user
exports.userLogin = function (req, res) {
    connection.query("SELECT * FROM useradmin where userName=? AND userPassword=?", [req.body.username, req.body.password], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

//Save new user
module.exports.saveUserInfo = function (req, res) {
    let formDetails = req.body.formDetails;
    // user table data
    let userDetail = formDetails;
    userDetail["userCreatedDate"] = new Date();
    if (userDetail.joiningDate) {
        userDetail["joiningDate"] = new Date(userDetail.joiningDate)
    }
    if (userDetail.leavingDate) {
        userDetail["leavingDate"] = new Date(userDetail.leavingDate)
    }
    // added user history table data
    let userHistoryObj = {
        'employeeCode': userDetail.employeeCode,
        'userFullName': userDetail.userFullName,
        'createdByEmail': userDetail.createdByEmail,
        'createdDate': new Date(),
        'towerId': userDetail.towerId
    }
    connection.query('INSERT INTO users SET ?', userDetail, function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully submited!!!!!" });
        } else {
            cd_userHistory.saveUserHistory(userHistoryObj);
            res.json({ 'data': results, 'error': "data successfully submited!!!!!" });
        }
    });
}
// Delete user
module.exports.deleteResouce = function (req, res) {
    let userDetail = req.body.userInfo;
    let userHistoryObj = {
        'employeeCode': userDetail.employeeCode,
        'userFullName': userDetail.userFullName,
        'deletedByEmail': userDetail.deletedByEmail,
        'deletedDate': new Date(),
        'towerId': userDetail.towerId
    }
    connection.query("DELETE FROM users WHERE userId = ?", [userDetail.userId], function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully deleted!!!!!" });
        } else {
            connection.query("SELECT * FROM users", function (error, results, fields) {
                if (error) {
                    res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
                } else {
                    cd_userHistory.saveUserHistory(userHistoryObj);
                    res.json({ 'data': results, 'error': error });
                }
            });
        }
    })
}

//Update user information
module.exports.updationResouce = function (req, res) {
    let userDetail = req.body.formData;
    let condition = { userId: Number(userDetail.userId) };
    let details = {
        'employeeCode': userDetail.employeeCode,
        'userFullName': userDetail.userFullName,
        'userEmail': userDetail.userEmail,
        'contactNo': userDetail.contactNo,
        'joiningDate': new Date(userDetail.joiningDate),
        'leavingDate': new Date(userDetail.leavingDate),
        'ibuId': userDetail.ibuId,
        'accountId': userDetail.accountId,
        'projectId': userDetail.projectId,
        'status': userDetail.status,
        'imageURL': userDetail.imageURL,
        'towerId': userDetail.towerId,
        'locationId': userDetail.locationId
    }
    let userHistoryObj = {
        'employeeCode': userDetail.employeeCode,
        'userFullName': userDetail.userFullName,
        'updatedByEmail': userDetail.updatedByEmail,
        'updatedDate': new Date(),
        'towerId': userDetail.towerId
    }
    connection.query('UPDATE users SET ? WHERE ?', [details, condition], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully updated!!!!!" });
        } else {
            exports.updateBookedUser(userDetail.userFullName, userDetail.imageURL, userDetail.userId);
            connection.query("SELECT * FROM users", function (error, results) {
                if (error) {
                    res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
                } else {
                    cd_userHistory.saveUserHistory(userHistoryObj);
                    res.json({ 'data': results, 'error': error });
                }
            });
        }
    })
}

// Get all users list
exports.getAllResouceList = function (req, res) {
    connection.query("SELECT * FROM users WHERE towerId=?", [req.body.towerId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

// update booking user information
exports.updateBookedUser = function (fullname, imageURL, userid) {
    connection.query("UPDATE userbooking SET userFullName=?, imageURL=? WHERE userId=?", [fullname, imageURL, userid], function (error, results) {
        if (error) {
            console.log("error", error);
        }
    });
}

