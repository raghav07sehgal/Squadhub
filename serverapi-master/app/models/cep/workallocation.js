// get an instance of the jira connector
var connection = require('../../db/cepDBConfig');

module.exports.addWorkallocation = function (req, res) {
    var details = {
        'Id': Math.random().toString(36).replace('0.', ''),
        'ResourceName': req.body.username,
        'Project': req.body.issues,
        'status': req.body.status,
        'SubTask': req.body.subtasks,
        'SubTaskStatus': req.body.subtaskStatus,
        'BudgetedEffort': req.body.budgetedEffort,
        'EstimateTime': req.body.estimateTime,
        'StartDate': new Date(req.body.startDate.year + "-" + req.body.startDate.month + "-" + req.body.startDate.day),
        'EndDate': new Date(req.body.endDate.year + "-" + req.body.endDate.month + "-" + req.body.endDate.day),
        'TotalTime': req.body.totalTime,
        'userBlockedHours': req.body.userBlockedHours,
        'stakeHolder': req.body.stakeHolder
    }

    connection.query('INSERT INTO workallocation SET ?', details, function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully submited!!!!!" });
        } else {
            connection.query("SELECT * FROM workallocation", function (error, results, fields) {
                if (error) {
                    res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
                } else {
                    res.json({ 'data': results, 'error': error });
                }
            });
        }
    });
}