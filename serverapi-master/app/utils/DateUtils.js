/// get next and last date
var moment = require('moment-business-days');

exports.getLastAndNextDate = function (month) {
    var now = new Date();
    var tempDate = new Date(now);
    if (month == "last") {
        tempDate.setMonth(now.getMonth() - 1);
    } else if (month == "next") {
        tempDate.setMonth(now.getMonth() + 1);
    }
    var date = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 1);
    var strDate = date.getFullYear();

    if (date.getMonth() < 10) {
        strDate = strDate + "-0" + date.getMonth();
    } else {
        strDate = strDate + "-" + date.getMonth();
    }
    if (date.getDay() < 10) {
        strDate = strDate + "-0" + date.getDay();
    } else {
        strDate = strDate + "-" + date.getDay();
    }
    return strDate;
}

exports.calculateDays = function (req, res) {
    var estimateTime = req.body.estTime;
    var budgetedEffort = req.body.budgetedEffort;
    var days = moment(req.body.startDate, 'MM-DD-YYYY').businessDiff(moment(req.body.endDate, 'MM-DD-YYYY'));
    if (days <= 0) {
        days = 1;
    }
    estimateTime = days * estimateTime
    if (budgetedEffort <= estimateTime && req.body.startDate == req.body.endDate) {
        res.json({ 'data': { budgetedEffort: budgetedEffort, daysDiff: days } });
    } else if (budgetedEffort == estimateTime) {
        res.json({ 'data': { budgetedEffort: budgetedEffort, daysDiff: days } });
    } else if (budgetedEffort <= estimateTime && req.body.startDate != req.body.endDate) {
        res.json({ 'data': null, error: "Estimation Time should be less or equal to Budgeted Effort" });
    } else {
        budgetedEffort = estimateTime;
        res.json({ 'data': { budgetedEffort: budgetedEffort, daysDiff: days } });
    }
}

exports.getDDMonth = function (date) {
    var tempDate = new Date(date);
    let monthArr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUNE", "JULY", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return tempDate.getDate() + " " + monthArr[tempDate.getMonth()];
}
