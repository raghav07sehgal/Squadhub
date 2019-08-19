
// get an instance of the jira connector
var JiraClient = require('jira-connector');
var property = require('../../utils/property.json');

// create jira connection
exports.getJiraClientConnection = function (userName, password) {
    return new JiraClient({ host: property[0].config.authURL, basic_auth: { username: userName, password: password } });
}
