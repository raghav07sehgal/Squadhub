
var jiraConn = require('./jiraConnection.js');
var JiraClient = require('jira-connector');
var property = require('../../utils/property.json');
var DateUtils = require('../../utils/DateUtils.js');
var users = require('./users.js');
var progress_task = require('./progressStatus.js');

var jqlStrl = property[0].config.jqlStrl;
var userList = [];

var jira = null;

exports.jiraLogin = async function (req, res) {
    progress_task.init();
    progress_task.increaseProgress(Math.floor(0));
    jira = jiraConn.getJiraClientConnection(req.body.username, req.body.password);
    var count = 1;
    await jira.user.getUser({
        username: req.body.username
    }, function (error, data) {
        if (data) {
            progress_task.increaseProgress(100);
            res.json({ 'data': data, 'error': error });
        } else {
            res.json({ 'data': data, 'error': "Sorry, your username and password are incorrect - please try again." });
        }
    });
}

exports.getUsersAndToBePlannedTaskDetails = async function (req, res) {
    progress_task.init();
    progress_task.increaseProgress(Math.floor(0));
    jira = jiraConn.getJiraClientConnection(req.body.username, req.body.password);
    let startAt = 0;
    let filteredIssue = [];
    let filteredUsersName = [];
    let finalData = [];
    let count = 1;
    if (req.body.searchCSDNo) {
        let data = await getIssue(req.body.searchCSDNo);
        if (data) {
            filteredIssue.push(data);
        }
    } else {
        for (let i = 0; i < count; i++) {
            let data = await getToBePlannedIssues(startAt, req.body.status);
            if (!data || !data.issues || data.issues.length == 0) {
                continue;
            } else {
                count++;
            }
            for (let j = 0; j < data.issues.length; j++) {
                filteredIssue.push(data.issues[j]);
            }
            startAt = startAt + 50;
        }
    }
    obj = {};
    obj['filteredIssues'] = filteredIssue;
    obj["userList"] = filteredUsersName;
    finalData.push(obj);
    console.log("*******Sucessfully*******");
    res.json({ 'data': finalData });
}


exports.generateCEPReport = async function (req, res) {
    console.log(">>>>>>>>>>>>>>>>>>>>>Inside generateCEPReport>>>>>>>>");
    progress_task.init();
    progress_task.increaseProgress(Math.floor(0));
    jira = jiraConn.getJiraClientConnection(req.body.username, req.body.password);
    let startAt = 0;
    let userDtaList = [];
    let totalIssueCount = 0
    let count = 1;
    for (let i = 0; i < count; i++) {
        let data = await getCEPAllIssues(startAt, req.body.startDate, req.body.endDate, req.body.filterName);
        if (!data || !data.issues || data.issues.length == 0) {
            continue;
        } else {
            count++;
        }
        userDtaList.push(data.issues);
        totalIssueCount = data.total;
        startAt = startAt + 50;
    }

    let obj = {};
    let finalData = [];
    let filteredIssue = [];
    let filteredUsersName = [];
    let linkIssuesSubTask = [];
    let userSubTask = [];
    let percentageCount = 1;
    //filter user issues
    console.log("total Records::::" + userDtaList.length)
    for (let i = 0; i < userDtaList.length; i++) {
        let data = userDtaList[i];
        for (let j = 0; j < data.length; j++) {
            filteredIssue.push(data[j]);
        }
        //filter issue sub-link
        for (let j = 0; j < data.length; j++) {
            for (let k = 0; k < data[j].fields.issuelinks.length; k++) {
                if (data[j].fields.issuelinks.length > 0 && data[j].fields.issuelinks[k].outwardIssue) {
                    let issueData = await getIssue(data[j].fields.issuelinks[k].outwardIssue.key);
                    if (issueData.fields.subtasks && issueData.fields.subtasks.length > 0) {
                        for (let l = 0; l < issueData.fields.subtasks.length; l++) {
                            let subTaskData = await getIssue(issueData.fields.subtasks[l].key);
                            if (subTaskData) {
                                let timetracking = getDayAndWeeksHours(subTaskData.fields.timetracking);
                                if (subTaskData.fields.assignee) {
                                    let obj = {
                                        issuetype: subTaskData.fields.issuetype,
                                        displayName: subTaskData.fields.assignee.displayName,
                                        key: subTaskData.key, timetracking: timetracking,
                                        worklog: getDayAndWeeksHoursArr(subTaskData.fields.worklog),
                                        plannedStartDate: subTaskData.fields.customfield_10700,
                                        plannedEndDate: subTaskData.fields.customfield_10701,
                                        summary: subTaskData.fields.summary

                                    };
                                    data[j].fields.subtasks.push(obj);
                                } else {
                                    let obj = {
                                        issuetype: subTaskData.fields.issuetype,
                                        key: subTaskData.key, timetracking: getDayAndWeeksHours(subTaskData.fields.timetracking),
                                        worklog: getDayAndWeeksHoursArr(subTaskData.fields.worklog),
                                        plannedStartDate: subTaskData.fields.customfield_10700,
                                        plannedStartDate: subTaskData.fields.customfield_10701,
                                        summary: subTaskData.fields.summary
                                    };
                                    data[j].fields.subtasks.push(obj);
                                }
                            }
                        }
                    } else {
                        if (issueData.fields.assignee) {
                            data[j].fields.subtasks.push({
                                displayName: issueData.fields.assignee.displayName,
                                timetracking: getDayAndWeeksHours(issueData.fields.timetracking),
                                worklog: getDayAndWeeksHoursArr(issueData.fields.worklog)
                            });
                        } else {
                            data[j].fields.subtasks.push({
                                timetracking: getDayAndWeeksHours(issueData.fields.timetracking),
                                worklog: getDayAndWeeksHoursArr(issueData.fields.worklog)
                            });
                        }
                    }
                }
            }
            let parcent = ((percentageCount / totalIssueCount) * 100);
            progress_task.increaseProgress(Math.floor(parcent));
            percentageCount++;
        }
        userDtaList[i] = data;
    }

    for (var j = 0; j < linkIssuesSubTask.length; j++) {
        if (linkIssuesSubTask[j][0] && linkIssuesSubTask[j][0].key != -1) {
            var data = await getIssue(linkIssuesSubTask[j][0].key);
            userSubTask.push(data);
        }
    }

    for (var j = 0; j < userSubTask.length; j++) {
        if (userSubTask[j].fields.assignee && filteredUsersName.indexOf(userSubTask[j].fields.assignee.displayName) < 0) {
            filteredUsersName.push(userSubTask[j].fields.assignee.displayName);
        }
    }

    obj = {};
    obj['cepFilteredIssues'] = filteredIssue;
    obj["cepUserList"] = filteredUsersName;
    finalData.push(obj);
    console.log("###########Completed##################");
    res.json({ 'data': finalData });
}

// fetch all users based on project
async function getUsers() {
    return new Promise(function (resolve, reject) {
        jira.user.multiProjectSearchAssignable({
            projectKeys: ['CSD']
        }, function (error, usersData) {
            if (usersData && usersData != null) {
                for (var i = 0; i < usersData.length; i++) {
                    userList.push({ "displayName": usersData[i].displayName, "userName": usersData[i].key });
                }
            }
            if (error) {
                resolve(error);
            } else {
                resolve(userList);
            }
        });
    });
}

// fetch all issues
async function getToBePlannedIssues(startAt, status) {
    //fetch all project
    return new Promise(function (resolve, reject) {
        jira.search.search({
            startAt: startAt,
            maxResults: 50,
            jql: property[0].config.jqlToBePlanned + "(" + status + ")",
            fields: ["assignee", "customfield_10864", "customfield_10863", "customfield_10219", "customfield_10600", "customfield_11700", "status"]
        }, function (error, data) {
            if (error) {
                resolve(error);
            } else {
                resolve(data);
            }
        });
    });
}

async function getCEPAllIssues(startAt, startDate, endDate, filterName) {
    if (filterName != "createdDate" && filterName != "updatedDate") {
        filterName = "'" + filterName + "'";
    }
    return new Promise(function (resolve, reject) {
        jira.search.search({
            startAt: startAt,
            maxResults: 50,
            jql: "project='CEP Service Desk' AND " + filterName + ">='" + startDate + "' AND " + filterName + "<='" + endDate + "'"
        }, function (error, data) {
            if (error) {
                resolve(error);
            } else {
                resolve(data);
            }
        });
    });
}

function getDayAndWeeksHours(timetracking) {
    timetracking.originalEstimate = getHours(timetracking.originalEstimate);
    timetracking.timeSpent = getHours(timetracking.timeSpent);
    timetracking.remainingEstimate = getHours(timetracking.remainingEstimate);
    return timetracking;
}

function getDayAndWeeksHoursArr(worklog) {
    for (var i = 0; i < worklog.worklogs.length; i++) {
        worklog.worklogs[i].timeSpent = getHours(worklog.worklogs[i].timeSpent);
    }
    return worklog;
}

function getHours(time) {
    if (!time) {
        return 0;
    }
    let hours = 0;
    let min = 0;
    let arr = "";
    if (time.length > 1) {
        arr = time.split(" ");
    } else if (time.length == 1) {
        hours = time;
    }
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].toLocaleLowerCase().indexOf("w") != -1) {
            arr[i] = arr[i].replace('w', '');
            hours = hours + ((Number(arr[i]) * 5) * 8);
        }
        if (arr[i].toLocaleLowerCase().indexOf("d") != -1) {
            arr[i] = arr[i].replace('d', '');
            hours = hours + (Number(arr[i]) * 8);
        }
        if (arr[i].toLocaleLowerCase().indexOf("h") != -1) {
            arr[i] = arr[i].replace('h', '');
            hours = hours + Number(arr[i]);
        }
        if (arr[i].toLocaleLowerCase().indexOf("m") != -1) {
            arr[i] = arr[i].replace('m', '');
            min = Number(arr[i]) / 60
        }
    }
    if (min > 0) {
        if (hours > 0) {
            min = Number.parseFloat(Number(min)).toFixed(2);
            hours = Number(hours) + Number(min)
        } else {
            hours = Number.parseFloat(min).toFixed(2);
        }
    }
    return hours;
}

// fetch issue
async function getIssue(issueKey) {
    return new Promise(function (resolve, reject) {
        jira.issue.getIssue({
            issueKey: issueKey
        }, function (error, data) {
            if (error) {
                resolve(error);
            } else {
                resolve(data);
            }
        });
    });
}

//update jira CSD status 
exports.updateJiraTicketStatus = async function (csdNo, transitionId) {
    return new Promise(function (resolve, reject) {
        jira.issue.transitionIssue({
            issueKey: csdNo,
            transition: { 'id': transitionId }
        }, function (error, data) {
            if (error) {
                resolve(error);
            } else {
                resolve(data);
            }
        });
    });
}


exports.getAllCSDClinetNameFromJIRA = async function (req, res) {
    progress_task.init();
    progress_task.increaseProgress(Math.floor(0));
    jira = jiraConn.getJiraClientConnection(req.body.username, req.body.password);
    let count = 1;
    let CSDDtaList = [];
    let startAt = 0;
    for (let i = 0; i < count; i++) {
        let data = await getAllCSDClinetName(startAt, req.body.csdsStr, req.body.noOfCSD);
        if (!data || !data.issues || data.issues.length == 0) {
            continue;
        } else {
            count++;
        }
        for (let j = 0; j < data.issues.length; j++) {
            CSDDtaList.push(data.issues[j]);
        }
        startAt = startAt + 50;
    }

    res.json({ 'data': CSDDtaList });
}

async function getAllCSDClinetName(startAt, listOfCSD, noOfCSD) {
    var jqiString = "project=CSD AND key in (" + listOfCSD + ")";
    return new Promise(function (resolve, reject) {
        jira.search.search({
            startAt: startAt,
            maxResults: noOfCSD,
            jql: jqiString,
            fields: ["customfield_10600"],
        }, function (error, data) {
            if (error) {
                resolve(error);
            } else {
                resolve(data);
            }
        });
    });
}