// get an instance of the jira connector
let connection = require('../../db/mediaDBConfig');

// Get management users info
exports.getModulesConfigList = function (req, res) {
    connection.query("SELECT * FROM moduleconfig", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

// Get management users info
exports.getModulesConfigInfoBytowerId = function (req, res) {
    connection.query("SELECT * FROM moduleconfig where towerId=?", [req.body.towerId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}
// Get management users info
exports.getModuleConfigInfo = function (req, res) {
    connection.query("SELECT moduleConfigJSON FROM moduleconfig where towerId = ?", [req.body.towerId], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

//save module config info
exports.saveModuleConfig = function (req, res) {
    connection.query('INSERT INTO moduleconfig SET moduleConfigJSON = ?, towerId = ?', [req.body.moduleConfig.moduleConfigJSON, req.body.moduleConfig.towerId], function (error, results, fields) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully submited!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully submited!!!!!" });
        }
    });
}

// Update management user info
exports.updateModuleConfig = function (req, res) {
    let moduleConfig = req.body.moduleConfig;
    let condition = { moduleId: Number(moduleConfig.moduleId) };
    let details = {
        'moduleConfigJSON': moduleConfig.moduleConfigJSON,
        'towerId': moduleConfig.towerId,
    }
    connection.query('UPDATE moduleconfig SET ? WHERE ?', [details, condition], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully updated!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully updated!!!!!" });
        }
    })
}