var connection = require('../../db/cepDBConfig');

module.exports.saveSkillsData = function (req, res) {
    let userData = [];
    if (req.body.userSkillData.length > 0) {
        for (let i = 0; i < req.body.userSkillData.length; i++) {
            let skill = req.body.userSkillData[i];
            let values = [];
            values.push(skill.user_id);
            values.push(skill.skill_id);
            values.push(skill.skill_level);
            userData.push(values);
        }
    }
    connection.query('INSERT INTO skill_user (user_id, skill_id, skill_level) VALUES ?', [userData], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully submited!!!!!" });
        } else {
            res.json({ 'data': results, 'error': "data successfully submited!!!!!" });
        }
    });
}

module.exports.updationSkillData = function (updateSkillSetData) {
    for (let i = 0; i < updateSkillSetData.length; i++) {
        let sql = "UPDATE skill_user SET skill_level='" + updateSkillSetData[i].skill_level + "' WHERE user_id=" + Number(updateSkillSetData[i].user_id) + " AND skill_id=" + Number(updateSkillSetData[i].skill_id);
        connection.query(sql, function (error, results) {
            if (error) {
                console.log("error", error);
            }
        })
    }
}
exports.getSkillDetails = function (req, res) {
    connection.query("SELECT * FROM skill_master", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

exports.getSkillSetDetails = function (req, res) {
    connection.query("SELECT * FROM skill_user", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

exports.getUserSkillBySkillId = function (req, res) {
    let skill_id = req.body.skill_id;
    connection.query("SELECT * FROM skill_user where skill_id=" + skill_id, function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}

exports.fetchAllSkills = function (req, res) {
    connection.query("SELECT * FROM skill_user WHERE user_id in (?)", [req.body.userIds], function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });

}

exports.fetchSkillData = function (req, res) {
    connection.query("SELECT * FROM skill_master", function (error, results) {
        if (error) {
            res.json({ 'data': results, 'error': "data not successfully retrieved!!!!!" });
        } else {
            res.json({ 'data': results, 'error': error });
        }
    });
}