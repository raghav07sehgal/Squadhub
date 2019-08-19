let connection = require('../../db/mediaDBConfig');

//save booking history
exports.saveBookingHistory = function (bookingHistory) {
    for (let i = 0; i < bookingHistory.length; i++) {
        connection.query('INSERT INTO bookinghistory SET ?', bookingHistory[i], function (error, results) {
            if (error) {
                console.log("error", error);
            }
        });
    }

}
// get booking history
exports.getBookingHistory = function (req, res) {
    let sql = "SELECT * FROM bookinghistory where towerId=?";
    connection.query(sql, [req.body.towerId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}