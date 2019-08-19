var mysql = require('mysql');
var dbCredential = require('../utils/dbCredential.json');
var db_config = {
    port: dbCredential.port,
    host: dbCredential.host,
    user: dbCredential.user,
    password: dbCredential.password,
    database: 'rts'
};

var connection;
function handleDisconnect() {
    connection = mysql.createPool(db_config);
    connection.getConnection(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 5000);
        }
    });

    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();
module.exports = connection;
