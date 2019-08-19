let connection = require('../../db/mediaDBConfig');
let common = require('../../utils/common.js');
let cd_bookingHistory = require('./media_bookingHistory.js');
let resMsg = "";

// save user booking
exports.bookedUser = async function (req, res) {
  let userData = [];
  let bookingHistory = [];
  let updatedUserData = req.body.updatedUserData;
  if (req.body.bookedUsers.length > 0) {
    for (let i = 0; i < req.body.bookedUsers.length; i++) {
      let user = req.body.bookedUsers[i];
      let values = [];
      values.push(user.userId);
      values.push(user.userFullName);
      values.push(user.createdByFullName);
      values.push(user.createdByEmail);
      values.push(user.accountId);
      values.push(user.projectId);
      values.push(user.assignHour);
      values.push(user.percentage);
      values.push(user.status);
      values.push(user.bookingDate);
      values.push(new Date());
      values.push(user.imageURL);
      values.push(user.towerId);
      userData.push(values);
      //added data for booking history
      let histObj = {
        userId: user.userId,
        userFullName: user.userFullName,
        accountId: user.accountId,
        projectId: user.projectId,
        assignHours: user.assignHour,
        bookingDate: new Date(user.bookingDate),
        createdByName: user.createdByFullName,
        createdByEmail: user.createdByEmail,
        createDate: new Date(),
        towerId: user.towerId
      }
      bookingHistory.push(histObj);
    }
    let sqlQuery = "INSERT INTO userbooking (userId, userFullName, createdByFullName, createdByEmail, accountId, projectId, assignHour, percentage, status, bookingDate, bookingCreateDate, imageURL, towerId) VALUES ?";
    connection.query(sqlQuery, [userData], function (error, results) {
      if (error) {
        resMsg = "Save not successfully!!!!";
        console.log(error)
      } else {
        cd_bookingHistory.saveBookingHistory(bookingHistory);
        resMsg = "Save";
      }
    });
  }
  if (updatedUserData.length > 0) {
    exports.updateBookedUser(updatedUserData);
  }
  resMsg = resMsg + " Saved Successfully";
  res.json({ 'data': resMsg, 'error': "" });
}

// update users booking
exports.updateBookedUser = function (updatedUserData) {
  let bookingHistory = [];
  for (let i = 0; i < updatedUserData.length; i++) {
    let user = updatedUserData[i];
    let histObj = {
      userId: user.userId,
      userFullName: user.userFullName,
      accountId: user.accountId,
      projectId: user.projectId,
      assignHours: user.updatedHours,
      bookingDate: new Date(user.bookingDate),
      updatedByName: user.updatedByName,
      updatedByEmail: user.updatedByEmail,
      updatedDate: new Date(),
      towerId: user.towerId
    }
    bookingHistory.push(histObj);
  }

  let sql = "UPDATE userbooking SET projectId=?, assignHour=?, percentage=?, status=? WHERE userid=? and bookingid=?";
  for (let i = 0; i < updatedUserData.length; i++) {
    connection.query(sql, [updatedUserData[i].projectId, updatedUserData[i].assignHour, updatedUserData[i].percentage, updatedUserData[i].status, updatedUserData[i].userId, updatedUserData[i].bookingId], function (error, results) {
      if (error) {
        console.log("error", error);
      }
    });
  }
  cd_bookingHistory.saveBookingHistory(bookingHistory);
  resMsg = resMsg + " And Update";
}

//delete user booking
exports.deletBookedUser = function (req, res) {
  //added data for booking history
  let bookingHistory = [];
  for (let i = 0; i < req.body.deleteBookingArray.length; i++) {
    let user = req.body.deleteBookingArray[i];
    if (user.user) {
      user = user.user;
    }
    let histObj = {
      userId: user.userId,
      userFullName: user.userFullName,
      accountId: user.accountId,
      projectId: user.projectId,
      assignHours: user.assignHour,
      bookingDate: new Date(user.bookingDate),
      deletedByName: user.deletedByName,
      deletedByEmail: user.deletedByEmail,
      deleteDate: new Date(),
      towerId: user.towerId
    }
    bookingHistory.push(histObj);
  }
  let sql = 'DELETE FROM userbooking WHERE bookingId in (?)';
  connection.query(sql, [req.body.deletedUser], function (error, results, fields) {
    if (error) {
      res.json({ 'data': results, 'error': "Delete not successfully!!!!!" });
    } else {
      cd_bookingHistory.saveBookingHistory(bookingHistory);
      res.json({ 'data': results, 'error': error });
    }
  })
}

// Get booking by condisional
exports.getBookedUsersByIds = function (req, res) {
  if (!req.body.startdate) {
    let date = new Date();
    req.body.startdate = date.getFullYear() + "-" + Number(date.getMonth() + 1) + "-" + date.getDate();
  }
  let filterSql = "SELECT userId FROM users WHERE leavingDate IS NULL OR leavingDate >= '" + req.body.startdate + "' OR leavingDate = ''"
  let sql = "SELECT * FROM userbooking WHERE userid IN (" + filterSql + ") AND ";
  let parameterArray = [];
  if (req.body.startdate && req.body.enddate) {
    parameterArray.push(req.body.startdate);
    parameterArray.push(req.body.enddate);
    sql = sql + 'bookingDate >= ? AND bookingDate <= ?';
  } else if (req.body.startdate && req.body.selectedValue) {
    parameterArray.push(req.body.startdate);
    parameterArray.push(req.body.selectedValue);
    sql = sql + 'bookingDate >= ? AND projectId = ?';
  } else {
    parameterArray.push(req.body.startdate);
    sql = sql + 'bookingDate >= ?';
  }
  sql = sql + " AND towerId=?"
  parameterArray.push(req.body.towerId)
  connection.query(sql, parameterArray, function (error, results) {
    if (error) {
      res.json({ 'data': results, 'error': "Fetched not successfully!!!!!" });
    } else {
      res.json({
        'data': results,
        'error': error
      });
    }
  });
}

// Get booked users work load data
exports.getBookedUsersWorkLoadData = function (req, res) {
  let details = {
    'StartDate': req.body.startDate.year + "-" + req.body.startDate.month + "-" + req.body.startDate.day,
    'EndDate': req.body.endDate.year + "-" + req.body.endDate.month + "-" + req.body.endDate.day,
  }
  connection.query("SELECT * FROM userbooking WHERE bookingDate >=? AND bookingDate <=? AND towerId=?", [details.StartDate, details.EndDate, req.body.towerId], function (error, results) {
    if (error) {
      res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });
}

// Get booked users by account name
exports.getBookedUsersByAccount = function (req, res) {
  connection.query("SELECT * FROM userbooking WHERE userId IN (" + common.getUserEmailSelectQuery() + ") AND csdno=? AND towerId=? ORDER BY status ASC", [req.body.csdNo, req.body.towerId], function (error, results, fields) {
    if (error) {
      res.json({
        'data': results, 'error': "Fetch not successfully !!!!!"
      });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });
}

//get Booked Utilization Resource data
exports.getBookedUtilizationResource = function (req, res) {
  connection.query("SELECT * FROM userbooking where bookingDate >=? AND bookingDate <=? AND towerId=? ORDER BY bookingDate asc", [req.body.startDate, req.body.endDate, req.body.towerId], function (error, results) {
    if (error) {
      res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });
}

// get total of booking hours of project 
exports.getSelectedHoursCount = function (req, res) {
  connection.query("SELECT sum(assignHour) FROM userbooking where projectId=? AND towerId=?", [req.body.selectedValue, req.body.towerId], function (error, results) {
    if (error) {
      res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });

  //get Bookings
  exports.getBookings = function (req, res) {
    let formData = req.body.formData;
    connection.query("SELECT * FROM userbooking WHERE projectId=? AND bookingDate>=? AND bookingDate <=? AND towerId=?", [formData.projectId, formData.sDate, formData.eDate, formData.towerId], function (error, results) {
      if (error) {
        res.json({ 'data': results, 'error': "Fetched not successfully!!!!!" });
      } else {
        res.json({ 'data': results, 'error': error });
      }
    });
  }

  //get User Booking Data
  exports.getUserBookingData = function (req, res) {
    let formData = req.body.formData;
    connection.query("SELECT * FROM userbooking WHERE projectId=? AND userFullName=? AND bookingDate>=? AND bookingDate <=? AND towerId=?", [formData.projectId, formData.filterUser, formData.sDate, formData.eDate, formData.towerId], function (error, results) {
      if (error) {
        res.json({ 'data': results, 'error': "Fetched not successfully!!!!!" });
      } else {
        res.json({ 'data': results, 'error': error });
      }
    });
  }

  // update booking data
  exports.updateBookingHours = function (req, res) {
    let bookingData = req.body.bookingData;
    let bookingHistoryObj = [];
    let result = "";
    let errors = "";
    let sql = "UPDATE userbooking SET assignHour=?, status=? , percentage=? WHERE userId=? and accountId=? and projectId=? and bookingId=?";
    for (let i = 0; i < bookingData.length; i++) {
      let historyObj = {};
      historyObj["userId"] = bookingData[i].userId;
      historyObj["accountId"] = bookingData[i].accountId;
      historyObj["projectId"] = bookingData[i].projectId;
      historyObj["userFullName"] = bookingData[i].userFullName;
      historyObj["assignHours"] = Number(bookingData[i].assignHour);
      historyObj["bookingDate"] = new Date(bookingData[i].bookingDate);
      historyObj["updatedByName"] = bookingData[i].updatedUser;
      historyObj["updatedDate"] = new Date();
      historyObj["towerId"] = bookingData[i].towerId;
      bookingHistoryObj.push(historyObj);
      connection.query(sql, [bookingData[i].assignHour, bookingData[i].status, bookingData[i].percentage, bookingData[i].userId, bookingData[i].accountId, bookingData[i].projectId, bookingData[i].bookingId], function (error, results) {
        if (error) {
          errors = error;
        } else {
          result = results;
        }
      });
    }
    if (bookingHistoryObj.length > 0) {
      cd_bookingHistory.saveBookingHistory(bookingHistoryObj);
    }
    res.json({ 'data': result, 'error': errors });
  }
}

// get project booking data
exports.getProjectBookingData = function (req, res) {
  connection.query("SELECT * FROM userbooking where projectId=? AND towerId=?", [req.body.projectId, req.body.towerId], function (error, results) {
    if (error) {
      res.json({ 'data': results, 'error': "Fetched not successfully!!!!!" });
    } else {
      res.json({ 'data': results, 'error': error });
    }
  });
}