let nodemailer = require('nodemailer');
let cron = require('node-cron');
let connection = require('../../db/mediaDBConfig');
let common = require('../../utils/common.js');
let DateUtils = require('../../utils/DateUtils.js');
let emailConfig = require('../../utils/emailConfig.json');

//outlook configuration 
// let transporter = nodemailer.createTransport(emailConfig.outlook);
//gmail configuration 
let transporter = nodemailer.createTransport(emailConfig.gmail);
//mailOptions configuration 
let mailOptions = emailConfig.mailOptions;

// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *
exports.emaiInit = async function () {
    cron.schedule('*/2 * * * *', () => {
        // cron.schedule(00 30 8 * * 0-5 ', () => {
        // sendEmail();
    });
}

async function sendEmail() {
    let startDate = getDateYYMMDD(false);
    let endDate = getDateYYMMDD(true);
    let dateArray = getDateArray(startDate, endDate);
    let bookingData = await getBookingData(dateArray[0], dateArray[dateArray.length - 1]);
    let userList = await getUserList();
    let emailData = [];

    let totalFreeResources = 0;
    let totalAvailable = {};
    let totalPartialAvailable = {};
    for (let i = 0; i < userList.length; i++) {
        emailData.push({ userId: userList[i].user_id, resourceName: userList[i].user_name });
    }
    for (let usrInd = 0; usrInd < userList.length; usrInd++) {
        let userId = userList[usrInd].user_id;
        for (let dateInd = 0; dateInd < dateArray.length; dateInd++) {
            let date = dateArray[dateInd];
            let freeHours = 0;
            for (let bkngInd = 0; bkngInd < bookingData.length; bkngInd++) {
                let bookingDate = new Date(bookingData[bkngInd].bookingdate);
                bookingDate = bookingDate.getFullYear() + "-" + (bookingDate.getMonth() + 1) + "-" + getDate(bookingDate.getDate());
                if (date == bookingDate && parseInt(bookingData[bkngInd].userid) == parseInt(userId)) {
                    freeHours = parseInt(freeHours) + parseInt(bookingData[bkngInd].assignhours);
                }
            }
            if (freeHours < 8) {
                freeHours = 8 - freeHours;
                if (freeHours <= 0) {
                    freeHours = 8;
                }
                for (let i = 0; i < emailData.length; i++) {
                    if (emailData[i].userId == userId) {
                        emailData[i][date] = freeHours;
                        break;
                    }
                }
            } else {
                for (let i = 0; i < emailData.length; i++) {
                    if (emailData[i].userId == userId) {
                        emailData[i][date] = 0;
                        break;
                    }
                }
            }
        }
    }
    for (let i = 0; i < emailData.length;) {
        let totalHousr = 0;
        for (let j = 0; j < dateArray.length; j++) {
            totalHousr = totalHousr + emailData[i][dateArray[j]];
        }
        if (totalHousr == 0) {
            let index = emailData.indexOf(emailData[i]);
            emailData.splice(index, 1);
            i = 0;
        } else {
            i++;
        }
    }


    for (let j = 0; j < dateArray.length; j++) {
        for (let i = 0; i < emailData.length; i++) {
            if (emailData[i][dateArray[j]] > 0 && emailData[i][dateArray[j]] < 8) {
                if (totalPartialAvailable[dateArray[j]]) {
                    totalPartialAvailable[dateArray[j]] = totalPartialAvailable[dateArray[j]] + 1;
                } else {
                    totalPartialAvailable[dateArray[j]] = 1;
                }

            } else if (emailData[i][dateArray[j]] == 8) {
                if (totalAvailable[dateArray[j]]) {
                    totalAvailable[dateArray[j]] = totalAvailable[dateArray[j]] + 1;
                } else {
                    totalAvailable[dateArray[j]] = 1;
                }
            }

        }
    }
    for (let i = 0; i < emailData.length;) {
        let name = emailData[i].resourceName.toLowerCase();
        if (name.indexOf('addition') != -1 || name.indexOf('shell') != -1 || name.indexOf('outsourced') != -1) {
            emailData.splice(i, 1);
            i = 0;
        } else {
            i++;
        }

    }
    totalFreeResources = emailData.length;
    let html = '<!DOCTYPE>';
    html = html + '<html>';
    html = html + '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';
    html = html + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';
    html = html + '<meta name="viewport" content="width=device-width, initial-scale=1.0" />';
    html = html + '<style>#freeResource {font-family: "Century Gothic", CenturyGothic;';
    html = html + 'border-collapse: collapse;min-width: 30%;max-width: 80%;width: 80%;}';
    html = html + '#freeResource td, #freeResource th {border: 1px solid #ddd; padding: 8px;';
    html = html + 'font-size: 14px;}#freeResource tr:nth-child(even) {background-color: #f2f2f2;';
    html = html + '}#freeResource tr:hover {background-color: #ddd;}#freeResource th {';
    html = html + 'padding-top: 12px;padding-bottom: 12px;text-align: center;background-color:rgb(91,155,213);';
    html = html + 'color: white;}#freeResource td {padding-top: 12px;padding-bottom: 12px;text-align: center;';
    html = html + 'background-color:rgb(28, 173, 236);color: white;text-align: center;}</style>';

    html = html + '<style>#totalfreeResource {font-family: "Century Gothic", CenturyGothic;';
    html = html + 'border-collapse: collapse;min-width: 30%;max-width: 80%;width: 80%;}';
    html = html + '#totalfreeResource td, #totalfreeResource th {border: 1px solid #ddd; padding: 14.9px;';
    html = html + 'font-size: 14px;}#totalfreeResource tr:nth-child(even) {background-color: #f2f2f2;';
    html = html + '}#totalfreeResource tr:hover {background-color: #ddd;}#totalfreeResource th {';
    html = html + 'padding-top: 12px;padding-bottom: 12px;text-align: center;background-color:rgb(235, 21, 42);';
    html = html + 'color: white;}#totalfreeResource td {padding-top: 12px;padding-bottom: 12px;text-align: center;';
    html = html + 'background-color:rgb(28, 173, 236);color: white;text-align: center;}</style>';

    html = html + '<style>#totalPartialResource {font-family: "Century Gothic", CenturyGothic;';
    html = html + 'border-collapse: collapse;min-width: 30%;max-width: 80%;width: 80%;}';
    html = html + '#totalPartialResource td, #totalPartialResource th {border: 1px solid #ddd; padding: 22.5px;';
    html = html + 'font-size: 14px;}#totalPartialResource tr:nth-child(even) {background-color: #f2f2f2;';
    html = html + '}#totalPartialResource tr:hover {background-color: #ddd;}#totalPartialResource th {';
    html = html + 'padding-top: 12px;padding-bottom: 12px;text-align: center;background-color: rgb(255, 152, 0);';
    html = html + 'color: white;}#totalPartialResource td {padding-top: 12px;padding-bottom: 12px;text-align: center;';
    html = html + 'background-color:rgb(28, 173, 236);color: white;text-align: center;}</style></head>';

    html = html + '<body style="margin: 0; padding: 0;">';
    html = html + '<h2>Resource Availability Report:- ' + DateUtils.getDDMonth(dateArray[0]) + ' - ' + DateUtils.getDDMonth(dateArray[dateArray.length - 1]) + '</h2>';
    //Total Available
    html = html + '<table border="1" border="1" cellpadding="0" cellspacing="0" id="totalfreeResource"><thead>';
    html = html + '<tr><th>100% Available</th>';
    for (let i = 0; i < dateArray.length; i++) {
        html = html + '<th>' + totalAvailable[dateArray[i]] + '</th>';
    }
    html = html + '</tr></thead></table>';
    //Partial Available
    html = html + '<table border="1" border="1" cellpadding="0" cellspacing="0" id="totalPartialResource"><thead>';
    html = html + '<tr><th>Partial Available</th>';
    for (let i = 0; i < dateArray.length; i++) {
        html = html + '<th>' + totalPartialAvailable[dateArray[i]] + '</th>';
    }
    html = html + '</tr></thead></table>';
    //Main table
    html = html + '<table border="1" cellpadding="0" cellspacing="0" id="freeResource"><thead><tr>';
    html = html + '<th>S.No</th>';
    html = html + '<th>Resource Name</th>';
    for (let i = 0; i < dateArray.length; i++) {
        html = html + '<th>' + dateArray[i] + '</th>';
    }
    html = html + '</tr></thead>';
    html = html + '<tbody>';
    for (let i = 0; i < emailData.length; i++) {

        html = html + '<tr><td>' + (i + 1) + '</td>';
        html = html + '<td style="text-align: left">' + emailData[i].resourceName + '</td>';
        for (let j = 0; j < dateArray.length; j++) {
            if (emailData[i][dateArray[j]] == 8) {
                html = html + '<td style="background: orange !important;">' + emailData[i][dateArray[j]] + '</td>';
            } else {
                html = html + '<td style="background: red !important;">' + emailData[i][dateArray[j]] + '</td>';
            }

        }
        html = html + '</tr>';
    }
    html = html + '</tbody></table></body></html>';
    mailOptions.html = html;

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}

function getDate(days) {
    if (days < 10) {
        return '0' + days;
    }
    return days;
}
async function getUserList() {
    return new Promise(function (resolve, reject) {
        connection.query(common.getUserSelectQuery(), function (error, results) {
            if (error) {
                resolve(error);
            } else {
                resolve(results);
            }
        });
    });
}

async function getBookingData(startDate, endDate) {
    return new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM booked_user where userid in (" + common.getUserEmailSelectQuery() + ") AND bookingdate >=? AND bookingdate <=?", [startDate, endDate], function (error, results) {
        // connection.query("SELECT * FROM booked_user where bookingdate >=? AND bookingdate <=?", [startDate, endDate], function (error, results) {
            if (error) {
                resolve(error);
            } else {
                resolve(results);
            }
        });
    });
}

function getDateYYMMDD(nextDays) {
    let date = new Date();
    if (nextDays) {
        date.setDate(date.getDate() + 5)
    }
    if (date) {
        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        let yy = date.getFullYear();
        return yy + "-" + mm + "-" + dd;
    }
}

function getDateArray(start, end) {
    let arr = new Array();
    let dt = new Date(start);
    end = new Date(end);
    let addNumOfDays = 0;
    while (dt <= end) {
        let date = new Date(dt)
        date.setDate(date.getDate() + addNumOfDays)
        if (date.getDay() == 0) {
            date.setDate(date.getDate() + 1);
            addNumOfDays = 1;
        } else if (date.getDay() == 6) {
            date.setDate(date.getDate() + 2)
            addNumOfDays = 2;
        }
        let day = '' + date.getDate() + '';
        if (date.getDate() < 10) {
            day = '0' + date.getDate()
        }
        arr.push(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + day);
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
}




// { Error: getaddrinfo ENOTFOUND http://172.17.1.91 http://172.17.1.91:25
//     at errnoException (dns.js:50:10)
//     at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:92:26)
//   code: 'ECONNECTION',
//   errno: 'ENOTFOUND',
//   syscall: 'getaddrinfo',
//   hostname: 'http://172.17.1.91',
//   host: 'http://172.17.1.91',
//   port: 25,
//   command: 'CONN' }