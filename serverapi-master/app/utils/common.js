exports.getUserSelectQuery = function () {
    let date = new Date();
    date = date.getFullYear() + "-" + Number(date.getMonth() + 1) + "-" + date.getDate();
    return "Select * From users Where leave_date is null or leave_date >= '" + date + "' or leave_date = '' AND towerName=?";
};

exports.getUserEmailSelectQuery = function () {
    let date = new Date();
    date = date.getFullYear() + "-" + Number(date.getMonth() + 1) + "-" + date.getDate();
    return "Select user_id From users Where leave_date is null or leave_date >= '" + date + "' or leave_date = '' AND towerName=?";
};