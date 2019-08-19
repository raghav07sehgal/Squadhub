let connection = require('../../db/mediaDBConfig');

//Get list of projects of account
exports.getProjectList = function (req, res) {
    connection.query("SELECT * FROM project where towerId=? ORDER BY projectName ASC", [req.body.towerId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

// Get projects info
exports.getProjectsList = function (req, res) {
    connection.query("SELECT * FROM project", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

// Get projects list By towerId 
exports.getProjectsListByTowerId = function (req, res) {
    connection.query("SELECT * FROM project where towerId=?", [req.body.towerId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

//Save project information
exports.saveProjectInfo = function (req, res) {
    connection.query('INSERT INTO project SET ?', [req.body.projectInfo], function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully submited!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully submited!!!!!" });
        }
    });
}

//Update project information
exports.updateProjectInfo = function (req, res) {
    let projectInfo = req.body.projectInfo;
    let condition = { projectId: Number(projectInfo.projectId) };
    let details = {
        'accountId': projectInfo.accountId,
        'projectName': projectInfo.projectName,
        'budgetedEffort': projectInfo.budgetedEffort,
        'towerId': projectInfo.towerId,
        'accountManager': projectInfo.accountManager,
        'towerId': projectInfo.towerId,
    }
    connection.query('UPDATE project SET ? WHERE ?', [details, condition], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully updated!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully updated!!!!!" });
        }
    })
}