
var jiraConn = require('./jiraConnection.js');
// get an instance of the jira connector
var JiraClient = require('jira-connector');
var property = require('../../utils/property.json');
var DateUtils = require('../../utils/DateUtils.js');
var users = require('./users.js');
var progress_task = require('./progressStatus.js');

var jqlStrl = property[0].config.jqlStrl;
var userList = [];

var jira = null;

exports.generateUserLogsReport = async function (req, res) {

    progress_task.init();

    jira = jiraConn.getJiraClientConnection(req.body.username, req.body.password);
    let startAt = 0;
    let totalIssueList = [];
    let totalIssueCount = 0
    //let userList = await getUsers();
    let count = 1;
    for (let i = 0; i < count; i++) {
        let data = await getAllUserLogs(startAt, req.body.startDate, req.body.endDate, req.body.filterName);
        if (!data || !data.issues || data.issues.length == 0) {
            //   continue;
        } else {
            count++;
        }
        totalIssueList.push(data.issues);
        totalIssueCount = data.total;
        startAt = startAt + 50;
    }

    let obj = {};
    let finalData = [];
    let filteredIssue = [];
    let filteredUsersName = [];
    let userSubTask = [];
    let percentageCount = 1;

    //filter user issues
    let checkIssueKeyList = [];
    console.log(">>>>>>>>>>>>>>>>>" + totalIssueList.length);
    for (let i = 0; i < totalIssueList.length; i++) {

        let data = totalIssueList[i];
        let filterData = [];
        let issuelinks = 1;
        //filter subtask worklog
        for (let j = 0; j < data.length; j++) {
            if (checkIssueKeyList.indexOf(data[j].key) > -1) {
                continue;
            }

            let linkedIssuesAndSubTask = [];
            if (data[j].fields && data[j].fields.parent) {
                let issuelinks = await getIssue(data[j].fields.parent.key);
                let budgetedEffort = 0;
                let budgetedEffortEngg = 0;
                let budgetedEffortEnggProd = 0;
                if (issuelinks.fields.customfield_10863 && issuelinks.fields.customfield_10863 > 0) {
                    budgetedEffort = issuelinks.fields.customfield_10863;// Budgeted Effort (Hrs) - Engineering
                    budgetedEffortEngg = issuelinks.fields.customfield_10863;
                }
                if (issuelinks.fields.customfield_10864 && issuelinks.fields.customfield_10864 > 0) {
                    budgetedEffort = Number(budgetedEffort) + Number(issuelinks.fields.customfield_10864);//Budgeted Effort (Hrs) - Production
                    budgetedEffortEnggProd = issuelinks.fields.customfield_10864;
                }
                let csdNo = '';
                if (issuelinks.fields.issuelinks.length > 0) {
                    if(issuelinks.fields.issuelinks[0].outwardIssue){
                        csdNo = issuelinks.fields.issuelinks[0].outwardIssue.key
                    }else if(issuelinks.fields.issuelinks[0].inwardIssue){
                        csdNo = issuelinks.fields.issuelinks[0].inwardIssue.key
                    }
                }
                issuelinks.fields.subtasks = getsubTask();
                if (checkIssueKeyList.indexOf(issuelinks.key) == -1 && issuelinks.fields && issuelinks.fields.worklog) {
                    issuelinks.fields.worklog = getWorklogs(issuelinks.fields.worklog, req.body.startDate, req.body.endDate);
                    if (issuelinks.fields.worklog && issuelinks.fields.worklog.worklogs.length > 0) {
                        if (issuelinks.fields.aggregatetimeoriginalestimate && Number(issuelinks.fields.aggregatetimeoriginalestimate) > 0) {
                            issuelinks.fields.aggregatetimeoriginalestimate = Number(issuelinks.fields.aggregatetimeoriginalestimate) / 3600;
                        }
                        checkIssueKeyList.push(issuelinks.key);
                        if (issuelinks.fields.assignee) {
                            issuelinks.fields.subtasks.push({ budgetedEffort: budgetedEffort, budgetedEffortProd: budgetedEffortEnggProd, budgetedEffortEngg: budgetedEffortEngg, aggregatetimeoriginalestimate: issuelinks.fields.aggregatetimeoriginalestimate, csdNo: csdNo, displayName: issuelinks.fields.assignee.displayName, timetracking: getDayAndWeeksHours(issuelinks.fields.timetracking), worklog: getDayAndWeeksHoursArr(issuelinks.fields.worklog) });
                        } else {
                            issuelinks.fields.subtasks.push({ budgetedEffort: budgetedEffort, budgetedEffortProd: budgetedEffortEnggProd, budgetedEffortEngg: budgetedEffortEngg, aggregatetimeoriginalestimate: issuelinks.fields.aggregatetimeoriginalestimate, csdNo: csdNo, displayName: "", timetracking: getDayAndWeeksHours(issuelinks.fields.timetracking), worklog: getDayAndWeeksHoursArr(issuelinks.fields.worklog) });
                        }
                    }
                }
                if (checkIssueKeyList.indexOf(data[j].key) == -1 && data[j].fields && data[j].fields.worklog) {
                    data[j].fields.worklog = getWorklogs(data[j].fields.worklog, req.body.startDate, req.body.endDate);
                    if (data[j].fields.worklog && data[j].fields.worklog.worklogs.length > 0) {
                        if (data[j].fields.aggregatetimeoriginalestimate && Number(data[j].fields.aggregatetimeoriginalestimate) > 0) {
                            data[j].fields.aggregatetimeoriginalestimate = Number(data[j].fields.aggregatetimeoriginalestimate) / 3600;
                        }
                        checkIssueKeyList.push(data[j].key);
                        if (data[j].fields.assignee) {
                            issuelinks.fields.subtasks.push({ budgetedEffort: budgetedEffort, budgetedEffortProd: budgetedEffortEnggProd, budgetedEffortEngg: budgetedEffortEngg, aggregatetimeoriginalestimate: data[j].fields.aggregatetimeoriginalestimate, csdNo: csdNo, displayName: data[j].fields.assignee.displayName, key: data[j].key, timetracking: getDayAndWeeksHours(data[j].fields.timetracking), worklog: getDayAndWeeksHoursArr(data[j].fields.worklog), aggregatetimeoriginalestimate: data[j].fields.aggregatetimeoriginalestimate });
                        } else {
                            issuelinks.fields.subtasks.push({ budgetedEffort: budgetedEffort, budgetedEffortProd: budgetedEffortEnggProd, budgetedEffortEngg: budgetedEffortEngg, aggregatetimeoriginalestimate: data[j].fields.aggregatetimeoriginalestimate, csdNo: csdNo, key: data[j].key, timetracking: getDayAndWeeksHours(data[j].fields.timetracking), worklog: getDayAndWeeksHoursArr(data[j].fields.worklog), aggregatetimeoriginalestimate: data[j].fields.aggregatetimeoriginalestimate });
                        }
                    }
                }
                if (issuelinks.fields.subtasks && issuelinks.fields.subtasks.length > 0) {
                    linkedIssuesAndSubTask.push(issuelinks);
                }
            } else {
                issuelinks = await getIssue(data[j].key);
                let csdNo = '';
                if (issuelinks.fields.issuelinks.length > 0) {
                    if(issuelinks.fields.issuelinks[0].outwardIssue){
                        csdNo = issuelinks.fields.issuelinks[0].outwardIssue.key
                    }else if(issuelinks.fields.issuelinks[0].inwardIssue){
                        csdNo = issuelinks.fields.issuelinks[0].inwardIssue.key
                    }
                }
                let budgetedEffort = 0;
                let budgetedEffortEngg = 0;
                let budgetedEffortEnggProd = 0;
                if (issuelinks.fields.customfield_10863 && issuelinks.fields.customfield_10863 > 0) {
                    budgetedEffort = issuelinks.fields.customfield_10863;// Budgeted Effort (Hrs) - Engineering
                    budgetedEffortEngg = issuelinks.fields.customfield_10863;
                }
                if (issuelinks.fields.customfield_10864 && issuelinks.fields.customfield_10864 > 0) {
                    budgetedEffort = Number(budgetedEffort) + Number(issuelinks.fields.customfield_10864);//Budgeted Effort (Hrs) - Production
                    budgetedEffortEnggProd = issuelinks.fields.customfield_10864;
                }
                issuelinks.fields.subtasks = getsubTask();
                if (checkIssueKeyList.indexOf(issuelinks.key) == -1 && issuelinks.fields && issuelinks.fields.worklog) {
                    issuelinks.fields.worklog = getWorklogs(issuelinks.fields.worklog, req.body.startDate, req.body.endDate);
                    if (issuelinks.fields.worklog && issuelinks.fields.worklog.worklogs.length > 0) {
                        if (issuelinks.fields.aggregatetimeoriginalestimate && Number(issuelinks.fields.aggregatetimeoriginalestimate) > 0) {
                            issuelinks.fields.aggregatetimeoriginalestimate = Number(issuelinks.fields.aggregatetimeoriginalestimate) / 3600;
                        }
                        checkIssueKeyList.push(issuelinks.key);
                        if (issuelinks.fields.assignee && issuelinks.fields.issuelinks.length > 0) {
                            issuelinks.fields.subtasks.push({ budgetedEffort: budgetedEffort, budgetedEffortProd: budgetedEffortEnggProd, budgetedEffortEngg: budgetedEffortEngg, aggregatetimeoriginalestimate: issuelinks.fields.aggregatetimeoriginalestimate, csdNo: csdNo, displayName: issuelinks.fields.assignee.displayName, timetracking: getDayAndWeeksHours(issuelinks.fields.timetracking), worklog: getDayAndWeeksHoursArr(issuelinks.fields.worklog) });
                        } else {
                            issuelinks.fields.subtasks.push({ budgetedEffort: budgetedEffort, budgetedEffortProd: budgetedEffortEnggProd, budgetedEffortEngg: budgetedEffortEngg, aggregatetimeoriginalestimate: issuelinks.fields.aggregatetimeoriginalestimate, csdNo: csdNo, timetracking: getDayAndWeeksHours(issuelinks.fields.timetracking), worklog: getDayAndWeeksHoursArr(issuelinks.fields.worklog) });
                        }
                    }
                }
                if (issuelinks.fields.subtasks && issuelinks.fields.subtasks.length > 0) {
                    linkedIssuesAndSubTask.push(issuelinks);
                }
            }
            if (linkedIssuesAndSubTask.length > 0) {
                filteredIssue.push(linkedIssuesAndSubTask);
            }

            let parcent = ((percentageCount / totalIssueCount) * 100);
            progress_task.increaseProgress(Math.floor(parcent));
            percentageCount++;
        }

    }

    obj = {};
    obj['userLogsData'] = filteredIssue;
    obj["userList"] = filteredUsersName;
    finalData.push(obj);
    jira = null;
    console.log("####################Completed########################");
    res.json({ 'data': finalData });
}

async function getAllUserLogs(startAt, startDate, endDate, filterName) {
    var jqiString = "project in('New Development',Pre-Sales,'Support & Maintenance') AND worklogDate >='" + startDate + "' AND worklogDate<='" + endDate + "'"
    //console.log(jqiString);
    //fetch all project
    //worklogDate >=2018-07-01 AND worklogDate<=2018-07-04"
    //createdDate>='2018/05/20 00:00' AND createdDate<='2018/06/19 23:00'
    // if (filterName != "createdDate" && filterName != "updatedDate" ) {
    //     filterName = "'" + filterName + "'";
    // }
    // "project='CEP Service Desk' AND key = CSD-395"
    return new Promise(function (resolve, reject) {
        jira.search.search({
            startAt: startAt,
            maxResults: 50,
            jql: jqiString,
            fields: ["customfield_10201", "parent", "worklog", "issuetype", "status", "assignee", "timetracking", "aggregatetimeoriginalestimate"],
        }, function (error, data) {
            if (error) {
                resolve(error);
            } else {
                resolve(data);
            }
        });
    });
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


function getsubTask() {
    let workLogArray = [];
    return workLogArray;
}

function getWorklogs(workLog, startDate, endDate) {
    let workLogArray = [];
    startDate = new Date(startDate);
    startDate = startDate.getTime();
    endDate = new Date(endDate);
    endDate = endDate.getTime();

    if (workLog && workLog.worklogs.length > 0) {
        for (let i = 0; i < workLog.worklogs.length; i++) {
            let workLogDate = new Date(workLog.worklogs[i].started);
            workLogDate = workLogDate.getFullYear() + "-" + Number(workLogDate.getMonth() + 1) + "-" + workLogDate.getDate();
            workLogDate = new Date(workLogDate);
            workLogDate = workLogDate.getTime();
            if (Number(workLogDate) >= Number(startDate) && Number(workLogDate) <= Number(endDate)) {
                workLogArray.push(workLog.worklogs[i]);
            }
        }
        workLog.worklogs = workLogArray;
    }
    return workLog;
}

function getDayAndWeeksHoursArr(worklog) {
    if (worklog && worklog.worklogs.length > 0) {
        for (var i = 0; i < worklog.worklogs.length; i++) {
            worklog.worklogs[i].timeSpent = getHours(worklog.worklogs[i].timeSpent);
        }
    }
    return worklog;
}

function getDayAndWeeksHours(timetracking) {
    if (timetracking) {
        timetracking.originalEstimate = getHours(timetracking.originalEstimate);
        timetracking.timeSpent = getHours(timetracking.timeSpent);
        timetracking.remainingEstimate = getHours(timetracking.remainingEstimate);
    }
    return timetracking;
}

function getHours(time) {
    if (!time) {
        return time;
    }
    let arr = time.split(" ");
    let hours = 0;
    let min = 0;
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

async function getWorkLogs(issueKey) {
    return new Promise(function (resolve, reject) {
        jira.issue.getWorkLogs({
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
