var connection = require('../../db/cepDBConfig');

module.exports.addBookingHistory = function (bookingHistory) {
    for (let i = 0; i < bookingHistory.length; i++) {
        connection.query('INSERT INTO bookinghistory SET ?', bookingHistory[i], function (error, results, fields) {
            if (error) {
                console.log(error);
            } else {

            }
        });
    }
    return
}