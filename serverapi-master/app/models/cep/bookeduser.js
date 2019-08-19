var connection = require('../../db/cepDBConfig');
var jiraApi = require('./jiraApi.js');
var common = require('../../utils/common.js');
var bookinghistory = require('./bookinghistory.js');
let resMsg = "";

exports.bookedUser = async function (req, res) {
  let userData = [];
  let updatedUserData = req.body.updatedUserData;
  let bookingHistoryObj = [];

  if (req.body.bookedUsers.length > 0) {
    for (let i = 0; i < req.body.bookedUsers.length; i++) {
      let user = req.body.bookedUsers[i];
      let values = [];
      values.push(user.userid);
      values.push(user.email);
      values.push(user.csdno);
      values.push(user.clientName);
      values.push(user.assignhours);
      values.push(user.fullname);
      values.push(user.percentage);
      values.push(user.status);
      values.push(user.bookingdate);
      values.push(user.avatarUrls);
      values.push(user.createdUser);
      values.push(new Date());
      userData.push(values);

      //create history data object
      let historyObj = {};
      historyObj["csdno"] = user.csdno;
      historyObj["bookingUser"] = user.fullname;
      historyObj["assignHours"] = user.assignhours;
      historyObj["bookingDate"] = user.bookingdate;
      historyObj["createdByUser"] = user.createdUser;
      historyObj["createdDate"] = new Date();
      bookingHistoryObj.push(historyObj);
    }

    let sqlQuery = "INSERT INTO booked_user (userid, email, csdno, clientName, assignhours, fullname, percentage, status, bookingdate, avatarUrls, createdByUser, createdDate) VALUES ?";
    connection.query(sqlQuery, [userData], function (error, results) {
      if (error) {
        resMsg = "Save not successfully!!!!";
      } else {
        resMsg = "Save";
      }
    });
  }
  if (updatedUserData.length > 0) {
    exports.updateBookedUser(updatedUserData);
  } else if (bookingHistoryObj.length > 0) {
    bookinghistory.addBookingHistory(bookingHistoryObj);
  }
  if (req.body.cSDStatus == "To be Planned" && req.body.changeCSDStatus) {
    await jiraApi.updateJiraTicketStatus(req.body.cSDNo, 11);
  }
  resMsg = resMsg + " Saved Successfully";
  res.json({
    'data': resMsg,
    'error': ""
  });

}

exports.updateBookedUser = function (updatedUserData) {
  let bookingHistoryObj = [];
  for (let i = 0; i < updatedUserData.length; i++) {
    let historyObj = {};
    historyObj["csdno"] = updatedUserData[i].csdno;
    historyObj["bookingUser"] = updatedUserData[i].fullname;
    historyObj["assignHours"] = Number(updatedUserData[i].assignhours);
    historyObj["bookingDate"] = updatedUserData[i].bookingdate;
    historyObj["updatedByUser"] = updatedUserData[i].updatedUser;
    historyObj["updatedDate"] = new Date();
    bookingHistoryObj.push(historyObj);
  }
  let sql = "UPDATE booked_user SET assignhours=?, percentage=?, status=? WHERE userid=? and bookingid=?";
  for (let i = 0; i < updatedUserData.length; i++) {
    connection.query(sql, [updatedUserData[i].assignhours, updatedUserData[i].percentage, updatedUserData[i].status, updatedUserData[i].userid, updatedUserData[i].bookingid], function (error, results) {
      if (error) {
        console.log("error", error);
      } else {
        if (bookingHistoryObj.length > 0) {
          bookinghistory.addBookingHistory(bookingHistoryObj);
        }
      }
    });
  }
  resMsg = resMsg + " And Update";
}

exports.deletBookedUser = function (req, res) {
  let bookingHistoryObj = [];
  let deletedUserList = req.body.deletedUserList;
  for (let i = 0; i < deletedUserList.length; i++) {
    let historyObj = {};
    historyObj["csdno"] = deletedUserList[i].csdno;
    historyObj["bookingUser"] = deletedUserList[i].fullname;
    historyObj["assignHours"] = Number(deletedUserList[i].assignhours);
    historyObj["bookingDate"] = new Date(deletedUserList[i].bookingdate);
    historyObj["deletedByUser"] = deletedUserList[i].deletedByUser;
    historyObj["deletedDate"] = new Date();
    bookingHistoryObj.push(historyObj);
  }
  let sql = 'DELETE FROM booked_user WHERE bookingid in (?)';
  connection.query(sql, [req.body.deletedUser], function (error, results, fields) {
    if (error) {
      res.json({
        'data': results,
        'error': "Delete not successfully!!!!!"
      });
    } else {
      if (bookingHistoryObj.length > 0) {
        bookinghistory.addBookingHistory(bookingHistoryObj);
      }
      connection.query("SELECT * FROM booked_user WHERE userid in (" + common.getUserEmailSelectQuery() + ") and csdno=?", req.body.selectedCSDNo, function (error, results, fields) {
        // connection.query("SELECT * FROM booked_user WHERE csdno=?", req.body.selectedCSDNo, function (error, results, fields) {
        if (error) {
          res.json({
            'data': results,
            'error': "Fetch not successfully !!!!!"
          });
        } else {
          res.json({
            'data': results,
            'error': error
          });
        }
      });
    }
  })
}

exports.getUserPlannedData = function (req, res) {
  let startdate = new Date(req.body.startdate);
  let enddate = new Date(req.body.enddate);
  if (!req.body.startdate) {
    let tempDate = new Date();
    req.body.startdate = tempDate.getFullYear() + "-" + (tempDate.getMonth() + 1) + "-" + tempDate.getDate();
  }
  let sql = "Select user_id From users Where leave_date is null or leave_date >= '" + req.body.startdate + "' or leave_date = ''"
  sql = "SELECT * FROM booked_user where userid in (" + sql + ") and ";
  // let sql = "SELECT * FROM booked_user where ";
  let parameterArray = [];
  if (!req.body.csdno && startdate.getTime() == enddate.getTime()) {
    parameterArray.push(req.body.startdate);
    sql = sql + 'bookingdate = ?';
  } else if (req.body.csdno && startdate) {
    parameterArray.push(req.body.csdno);
    parameterArray.push(req.body.startdate);
    sql = sql + 'csdno = ? or bookingdate >= ?';
  } else if (!req.body.csdno) {
    parameterArray.push(req.body.startdate);
    parameterArray.push(req.body.enddate);
    parameterArray.push(req.body.csdno);
    sql = sql + 'bookingdate >= ? AND bookingdate <= ?';
  } else {
    parameterArray.push(req.body.csdno);
    sql = sql + 'csdno = ?';
  }
  connection.query(sql, parameterArray, function (error, results) {
    if (error) {
      res.json({
        'data': results,
        'error': "Fetched not successfully!!!!!"
      });
    } else {
      res.json({
        'data': results,
        'error': error
      });
    }
  });
}

exports.getBookedUsersTotalAssignHours = function (req, res) {
  // connection.query("SELECT assignhours, bookingdate FROM booked_user where userid in (" + common.getUserEmailSelectQuery() + ") AND csdno=?", req.body.csdno, function (error, results) {
  connection.query("SELECT assignhours, bookingdate FROM booked_user where csdno=?", req.body.csdno, function (error, results) {
    if (error) {
      res.json({ 'data': results, 'error': "Fetched not successfully!!!!!" });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });
}

exports.getBookedUsersWorkLoadData = function (req, res) {
  var details = {
    'StartDate': req.body.startDate.year + "-" + req.body.startDate.month + "-" + req.body.startDate.day,
    'EndDate': req.body.endDate.year + "-" + req.body.endDate.month + "-" + req.body.endDate.day,
  }
  connection.query("SELECT * FROM booked_user where bookingdate >='" + details.StartDate + "' AND bookingdate <='" + details.EndDate + "'", function (error, results) {
    // connection.query("SELECT * FROM booked_user where bookingdate >='" + details.StartDate + "' AND bookingdate <='" + details.EndDate + "'", function (error, results) {
    if (error) {
      res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });
}

exports.getAllCSDList = function (req, res) {
  connection.query('SELECT * FROM booked_user WHERE bookingdate >= ? AND bookingdate <= ?', [req.body.startdate, req.body.enddate], function (error, results, fields) {
    if (error) {
      res.json({
        'data': results, 'error': "Fetch not successfully !!!!!"
      });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });
}

exports.getBookedUtilizationResource = function (req, res) {
  let sql = "Select user_id From users Where leave_date is null or leave_date >= '" + req.body.startDate + "' or leave_date = ''"
  connection.query("SELECT * FROM booked_user where userid in (" + sql + ") and bookingdate >='" + req.body.startDate + "' AND bookingdate <='" + req.body.endDate + "' ORDER BY bookingdate asc", function (error, results) {
    // connection.query("SELECT * FROM booked_user where bookingdate >='" + req.body.startDate + "' AND bookingdate <='" + req.body.endDate + "' ORDER BY bookingdate asc", function (error, results) {
    if (error) {
      res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });
}

exports.getSelectedTicketPlannedCount = function (req, res) {
  connection.query("SELECT sum(assignhours) FROM rts.booked_user where csdno=?", [req.body.csdno], function (error, results) {
    if (error) {
      res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });
}
exports.getBookings = function (req, res) {
  let formData = req.body.formData;
  connection.query("SELECT * FROM booked_user where csdno='" + formData.filterTicket + "' and bookingdate>='" + formData.sDate + "' and bookingdate <='" + formData.eDate + "'", function (error, results) {
    if (error) {
      res.json({ 'data': results, 'error': "Fetched not successfully!!!!!" });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });
}

exports.getUserBookingData = function (req, res) {
  let formData = req.body.formData;
  connection.query("SELECT * FROM booked_user where csdno='" + formData.filterTicket + "' and fullname='" + formData.filterUser + "' and bookingdate>='" + formData.sDate + "' and bookingdate <='" + formData.eDate + "'", function (error, results) {
    if (error) {
      res.json({ 'data': results, 'error': "Fetched not successfully!!!!!" });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });
}

exports.getBookingData = function (req, res) {
  let formData = req.body.formData;
  connection.query("SELECT * FROM booked_user where assignhours='" + formData.filterHours + "' and csdno='" + formData.filterTicket + "' and fullname='" + formData.filterUser + "' and bookingdate>='" + formData.sDate + "' and bookingdate <='" + formData.eDate + "'", function (error, results) {
    if (error) {
      res.json({ 'data': results, 'error': "Fetched not successfully!!!!!" });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });
}

exports.updateBookingHours = function (req, res) {
  let bookingData = req.body.bookingData;
  let bookingHistoryObj = [];
  let result = "";
  let errors = "";
  let sql = "UPDATE booked_user SET assignhours=?, status=? , percentage=? WHERE userid=? and csdno=? and bookingid=?";
  for (let i = 0; i < bookingData.length; i++) {
    let historyObj = {};
    historyObj["csdno"] = bookingData[i].csdno;
    historyObj["bookingUser"] = bookingData[i].fullname;
    historyObj["assignHours"] = Number(bookingData[i].assignhours);
    historyObj["bookingDate"] = new Date(bookingData[i].bookingdate);
    historyObj["updatedByUser"] = bookingData[i].updatedUser;
    historyObj["updatedDate"] = new Date();
    bookingHistoryObj.push(historyObj);
    connection.query(sql, [bookingData[i].assignhours, bookingData[i].status, bookingData[i].percentage, bookingData[i].userid, bookingData[i].csdno, bookingData[i].bookingid], function (error, results) {
      if (error) {
        errors = error;
      } else {
        result = results;
      }
    });
  }
  if (bookingHistoryObj.length > 0) {
    bookinghistory.addBookingHistory(bookingHistoryObj);
  }
  res.json({ 'data': result, 'error': errors });
}

function getHistoryData() {

}