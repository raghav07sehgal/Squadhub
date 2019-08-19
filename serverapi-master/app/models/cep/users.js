var jiraConn = require('./jiraConnection.js');
// get an instance of the jira connector
var JiraClient = require('jira-connector');
var progress_task = require('./progressStatus.js');
var connection = require('../../db/cepDBConfig');
var common = require('../../utils/common.js');
var userSkill = require('./userSkill.js');
var userHistory = require('./userHistory.js');


module.exports.addResouce = function (req, res) {
    let formDetails = req.body.formDetails;
    let leave_date = null;
    if (formDetails.leaveDate) {
        leave_date = formDetails.leaveDate.year + "-" + formDetails.leaveDate.month + "-" + formDetails.leaveDate.day;
    }
    // user table data
    let userDetail = {
        'Id': Math.random().toString(36).replace('0.', ''),
        'employeeCode': formDetails.employeeCode,
        'user_name': formDetails.resourceName,
        'type_resource': formDetails.typesResource,
        'join_date': formDetails.joinDate.year + "-" + formDetails.joinDate.month + "-" + formDetails.joinDate.day,
        'contact': formDetails.contactDetail,
        'leave_date': leave_date,
        'team': formDetails.selectedTeam,
        'email': formDetails.resourceEmail,
        'createdByEmail': formDetails.createdByEmail
    }
    // user history table data
    let userHistoryObj = {
        employeeCode: userDetail.employeeCode,
        userName: userDetail.user_name,
        joiningDate: userDetail.join_date,
        team: userDetail.team,
        resourceType: userDetail.type_resource,
        createdByEmail: userDetail.createdByEmail,
        skill_ST: formDetails.selectedStoryLine,
        skill_LT: formDetails.selectedLectora,
        skill_HT: formDetails.selectedHTML,
        createdDate: new Date()
    }
    connection.query('INSERT INTO users SET ?', userDetail, function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully submited!!!!!" });
        } else {
            userHistory.saveUserHistory(userHistoryObj);
            res.json({ 'data': results, 'error': "data successfully submited!!!!!" });
        }
    });
}

module.exports.deleteResouce = function (req, res) {
    let userDetail = req.body.userInfo;
    let userHistoryObj = {
        employeeCode: userDetail.employeeCode,
        userName: userDetail.user_name,
        joiningDate: userDetail.join_date,
        team: userDetail.team,
        resourceType: userDetail.type_resource,
        deletedByEmail: userDetail.deletedByEmail,
        skill_ST: userDetail.StoryLine,
        skill_LT: userDetail.Lectora,
        skill_HT: userDetail.HTML,
        deletedDate: new Date()
    }
    connection.query('DELETE FROM skill_user WHERE user_id = ?', [userDetail.user_id], function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully deleted!!!!!" });
        } else {
            connection.query('DELETE FROM users WHERE user_id = ?', [userDetail.user_id], function (error, results, fields) {
                if (error) {
                    res.json({ 'data': results, 'error': "data not successfully deleted!!!!!" });
                } else {
                    connection.query("SELECT * FROM users", function (error, results, fields) {
                        if (error) {
                            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
                        } else {
                            userHistory.saveUserHistory(userHistoryObj);
                            res.json({ 'data': results, 'error': error });
                        }
                    });
                }
            })
        }
    })
}

module.exports.updationResouce = function (req, res) {
    var userData = req.body.formData;
    var updateSkillSetData = req.body.updateSkillSetData;
    var condition = { user_id: Number(userData.userId) };
    var details = {
        'employeeCode': userData.employeeCode,
        'user_name': userData.resourceName,
        'type_resource': userData.typesResource,
        'join_date': userData.join_date,
        'contact': userData.contactDetail,
        'leave_date': userData.leave_date,
        'team': userData.selectedTeam,
        'email': userData.resourceEmail
    };
    let userHistoryObj = {
        employeeCode: userData.employeeCode,
        userName: userData.resourceName,
        joiningDate: userData.join_date,
        team: userData.selectedTeam,
        resourceType: userData.typesResource,
        updatedByEmail: userData.updatedByEmail,
        skill_ST: userData.selectedStoryLine,
        skill_LT: userData.selectedLectora,
        skill_HT: userData.selectedHTML,
        updatedDate: new Date()
    }

    connection.query('UPDATE users SET ? WHERE ?', [details, condition], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully updated!!!!!" });
        } else {
            if (updateSkillSetData.length > 0) {
                userSkill.updationSkillData(updateSkillSetData);
                exports.updateBookedUser(userData.resourceName, userData.userId);
            }
            connection.query("SELECT * FROM users", function (error, results) {
                if (error) {
                    res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
                } else {
                    userHistory.saveUserHistory(userHistoryObj);
                    res.json({ 'data': results, 'error': error });
                }
            });
        }
    })
}

exports.getAllResouceList = function (req, res) {
    connection.query("SELECT * FROM users", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

exports.getadminUserDetails = function (req, res) {
    connection.query("SELECT * FROM users", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}


exports.getHtmlUsersDetails = function (req, res) {
    connection.query(common.getUserSelectQuery() + " and user_id in (SELECT user_id FROM `skill_user` WHERE skill_id = 3 order BY(CASE skill_level WHEN '1_Expert' THEN 1 WHEN '2_Intermediate' THEN 2 WHEN '3_Beginner' THEN 3 END))", function (error, results) {
        // connection.query("Select * From users Where user_id in (SELECT user_id FROM `skill_user` WHERE skill_id = 3 order BY(CASE skill_level WHEN '1_Expert' THEN 1 WHEN '2_Intermediate' THEN 2 WHEN '3_Beginner' THEN 3 END))", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

exports.getLectoraUsersDetails = function (req, res) {
    connection.query(common.getUserSelectQuery() + " and  user_id in (SELECT user_id FROM `skill_user` WHERE skill_id = 2 order BY(CASE skill_level WHEN '1_Expert' THEN 1 WHEN '2_Intermediate' THEN 2 WHEN '3_Beginner' THEN 3 END))", function (error, results) {
        // connection.query("Select * From users Where user_id in (SELECT user_id FROM `skill_user` WHERE skill_id = 2 order BY(CASE skill_level WHEN '1_Expert' THEN 1 WHEN '2_Intermediate' THEN 2 WHEN '3_Beginner' THEN 3 END))", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

exports.getStorylineUsersDetails = function (req, res) {
    connection.query(common.getUserSelectQuery() + " and user_id in (SELECT user_id FROM `skill_user` WHERE skill_id = 1 order BY(CASE skill_level WHEN '1_Expert' THEN 1 WHEN '2_Intermediate' THEN 2 WHEN '3_Beginner' THEN 3 END))", function (error, results) {
        // connection.query("Select * From users Where user_id in (SELECT user_id FROM `skill_user` WHERE skill_id = 1 order BY(CASE skill_level WHEN '1_Expert' THEN 1 WHEN '2_Intermediate' THEN 2 WHEN '3_Beginner' THEN 3 END))", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

exports.updateBookedUser = function (fullname, userid) {
    connection.query("UPDATE booked_user SET fullname=? WHERE userid=?", [fullname, userid], function (error, results) {
        if (error) {
            console.log("error", error);
        }
    });
}

exports.getAllResouces = function (req, res) {
    connection.query("Select * From users Where leave_date is null or leave_date >= '" + req.body.startDate + "' or leave_date = ''", function (error, results) {
        // connection.query("Select * From users", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

exports.getCurrentAvailableUsers = function (req, res) {
    let date = new Date();
    date = date.getFullYear() + "-" + Number(date.getMonth() + 1) + "-" + date.getDate();
    connection.query("Select * From users Where leave_date is null or leave_date >= '" + date + "' or leave_date = ''", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

exports.getUtilizationResource = function (req, res) {
    connection.query("Select * From users Where leave_date is null or leave_date >= '" + req.body.startDate + "' or leave_date = '' and join_date <='" + req.body.endDate + "'", function (error, results) {
        // connection.query("Select * From users", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

// Jira Api calls
var jira = null;
exports.getUsers = async function (req, res) {
    jira = jiraConn.getJiraClientConnection(req.body.username, req.body.password);
    var count = 1;
    var resourceList = [];
    var freeResources = [];
    var startIndx = 0;
    var endIndex = 99;
    let totalIssueCount = 0;
    let percentageCount = 1;
    for (var i = 0; i < count; i++) {
        var groupUsers = await getGroupUsers(startIndx, endIndex);
        if (groupUsers.items == null || groupUsers.items.length <= 0) {
            break;
        }
        totalIssueCount = groupUsers.size;
        for (var j = 0; j < groupUsers.items.length; j++) {
            resourceList.push(groupUsers.items[j].displayName);
        }
        startIndx = endIndex;
        endIndex = endIndex + 100;
        count++;
    }
    for (var k = 0; k < resourceList.length; k++) {
        if (freeResources.indexOf(resourceList[k]) == -1 && resourceList[k] != "Admin") {
            freeResources.push(resourceList[k]);
        }
        let parcent = ((percentageCount / totalIssueCount) * 100);
        progress_task.increaseProgress(Math.floor(parcent));
        percentageCount++;
    }
    return freeResources;
}

async function getGroupUsers(startIndx, endIndex) {
    return new Promise(function (resolve, reject) {
        jira.group.getGroup({
            groupName: "CEP",
            expand: ["users[" + startIndx + ":" + endIndex + "]"]
        }, function (error, usersGroup) {
            if (error) {
                resolve(error);
            } else {
                resolve(usersGroup.users);
            }
        });
    });
}

async function getUserTask(userName) {
    return new Promise(function (resolve, reject) {
        jira.search.search({
            jql: 'assignee in ("' + userName + '") AND status in ("In Progress") AND updated <= now()'
        }, function (error, usersTask) {
            if (error) {
                resolve(error);
            } else {
                resolve(usersTask);
            }
        });
    });
}
