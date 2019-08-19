//#################API Import File  Start#########################################
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let cors = require('cors')
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let router = express.Router();

//#################Media Api Files#########################################
let media_account = require('./models/media/media_account.js');
let media_project = require('./models/media/media_project.js');
let media_bookeduser = require('./models/media/media_bookeduser.js');
let media_users = require('./models/media/media_users.js');
let media_sendBookingStatusEmail = require('./models/media/media_sendBookingStatusEmail.js');
let media_userHistory = require('./models/media/media_userHistory.js');
let media_tower = require('./models/media/media_tower.js');
let media_superUser = require('./models/media/media_superUser.js');
let media_ibu = require('./models/media/media_ibu.js');
let media_management = require('./models/media/media_management.js');
let media_moduleConfig = require('./models/media/media_moduleConfig.js');
let media_towerLocation = require('./models/media/media_towerLocation.js');

//#################CEP Api Files#########################################
var cep_jiraApi = require('./models/cep/jiraApi.js');
var cep_bookeduser = require('./models/cep/bookeduser.js');
var cep_users = require('./models/cep/users.js');
var cep_userSkill = require('./models/cep/userSkill.js');
var cep_workallocation = require('./models/cep/workallocation.js');
var cep_jiraUserLogs = require('./models/cep/jira_userlogs.js');
var cep_sendEmails = require('./models/cep/sendEmails.js');
var cep_progressJIRA = require('./models/cep/progressStatus.js');
var cep_sendBookingStatusEmail = require('./models/cep/sendBookingStatusEmail.js');
var cep_userHistory = require('./models/cep/userHistory.js');

let property = require('./utils/property.json');
//#################ssl keys#########################################
const fs = require('fs');
const options = {
    key: fs.readFileSync(__dirname + '/ssl/privatekey.pem'),
    cert: fs.readFileSync(__dirname + '/ssl/certificate.pem')
};
let timeout = 0;

//#################Media api calls#########################################

// Media account api calls
router.get('/media_getAccountsList', function (req, res) { req.setTimeout(timeout); media_account.getAccountsList(req, res) });
router.post('/media_saveAccountsInfo', function (req, res) { req.setTimeout(timeout); media_account.saveAccountnfo(req, res) });
router.post('/media_updateAccountsInfo', function (req, res) { req.setTimeout(timeout); media_account.updateAccountInfo(req, res) });
router.post('/media_getAccountsListByIbuId', function (req, res) { req.setTimeout(timeout); media_account.getAccountsListByIbuId(req, res) });
router.post('/media_getAccountsListByTowerId', function (req, res) { req.setTimeout(timeout); media_account.getAccountsListByTowerId(req, res) });
// Media project api calls
router.post('/media_getProjectList', function (req, res) { req.setTimeout(timeout); media_project.getProjectList(req, res) });
router.get('/media_getProjectsList', function (req, res) { req.setTimeout(timeout); media_project.getProjectsList(req, res) });
router.post('/media_saveProjectInfo', function (req, res) { req.setTimeout(timeout); media_project.saveProjectInfo(req, res) });
router.post('/media_updateProjectInfo', function (req, res) { req.setTimeout(timeout); media_project.updateProjectInfo(req, res) });
router.post('/media_getProjectsListByTowerId', function (req, res) { req.setTimeout(timeout); media_project.getProjectsListByTowerId(req, res) });

// Media management user api calls
router.post('/media_managementUserLogin', function (req, res) { req.setTimeout(timeout); media_management.managementUserLogin(req, res) });
router.get('/media_getManagementUsersList', function (req, res) { req.setTimeout(timeout); media_management.getManagementUsersList(req, res) });
router.post('/media_getManagementUsersListByTowerId', function (req, res) { req.setTimeout(timeout); media_management.getManagementUsersListByTowerId(req, res) });
router.post('/media_saveManagementUserInfo', function (req, res) { req.setTimeout(timeout); media_management.saveManagementUserInfo(req, res) });
router.post('/media_updateManagementUserInfo', function (req, res) { req.setTimeout(timeout); media_management.updateManagementUserInfo(req, res) });
router.get('/media_getAllUserRoleList', function (req, res) { req.setTimeout(timeout); media_management.getAllUserRoleList(req, res) });

// Media user api calls
router.post('/media_getAllUserList', function (req, res) { req.setTimeout(timeout); media_users.getAllResouceList(req, res) });
router.post('/media_saveUserInfo', function (req, res) { req.setTimeout(timeout); media_users.saveUserInfo(req, res) });
router.post('/media_updateUser', function (req, res) { req.setTimeout(timeout); media_users.updationResouce(req, res) });
router.post('/media_deleteUser', function (req, res) { req.setTimeout(timeout); media_users.deleteResouce(req, res) });

// Media user booking api calls
router.post('/media_getBookedUsers', function (req, res) { req.setTimeout(timeout); media_bookeduser.getBookedUsersByIds(req, res) });
router.post('/media_getSelectedHoursCount', function (req, res) { req.setTimeout(timeout); media_bookeduser.getSelectedHoursCount(req, res) });
router.post('/media_addBookedUser', function (req, res) { req.setTimeout(timeout); media_bookeduser.bookedUser(req, res) });
router.post('/media_deleteBookedUser', function (req, res) { req.setTimeout(timeout); media_bookeduser.deletBookedUser(req, res) });
router.post('/media_getAccountBookedUsers', function (req, res) { req.setTimeout(timeout); media_bookeduser.getBookedUsersByAccount(req, res) });
router.post('/media_bookedUtilizationResource', function (req, res) { req.setTimeout(timeout); media_bookeduser.getBookedUtilizationResource(req, res) });
router.post('/media_workload', function (req, res) { req.setTimeout(timeout); media_bookeduser.getBookedUsersWorkLoadData(req, res) });
router.post('/media_getBookings', function (req, res) { req.setTimeout(timeout); media_bookeduser.getBookings(req, res) });
router.post('/media_getUserBookingData', function (req, res) { req.setTimeout(timeout); media_bookeduser.getUserBookingData(req, res) });
router.post('/media_updateBookingHours', function (req, res) { req.setTimeout(timeout); media_bookeduser.updateBookingHours(req, res) });
router.post('/media_getProjectBookingData', function (req, res) { req.setTimeout(timeout); media_bookeduser.getProjectBookingData(req, res) });

// Media user history api calls
router.post('/media_getResourcesHistory', function (req, res) { req.setTimeout(timeout); media_userHistory.getResourcesHistory(req, res) });

// Media tower api calls
router.post('/media_getTowerInfo', function (req, res) { req.setTimeout(timeout); media_tower.getTowerInfo(req, res) });
router.get('/media_getTowerList', function (req, res) { req.setTimeout(timeout); media_tower.getTowerList(req, res) });
router.post('/media_saveTowerInfo', function (req, res) { req.setTimeout(timeout); media_tower.saveTowerInfo(req, res) });
router.post('/media_updateTowerInfo', function (req, res) { req.setTimeout(timeout); media_tower.updateTowerInfo(req, res) });
router.post('/media_getTowerInfoByIbuId', function (req, res) { req.setTimeout(timeout); media_tower.getTowerInfoByIbuId(req, res) });

// Media super api calls
router.post('/media_superUserLogin', function (req, res) { req.setTimeout(timeout); media_superUser.superUserLogin(req, res) });
router.post('/media_getSuperUserInfo', function (req, res) { req.setTimeout(timeout); media_superUser.getSuperUserInfo(req, res) });
router.post('/media_saveSuperUserInfo', function (req, res) { req.setTimeout(timeout); media_superUser.saveSuperUserInfo(req, res) });
router.post('/media_updationSuperUserInfo', function (req, res) { req.setTimeout(timeout); media_superUser.updationSuperUserInfo(req, res) });
router.get('/media_getSuperUserList', function (req, res) { req.setTimeout(timeout); media_superUser.getSuperUserList(req, res) });

// Media ibu api calls
router.get('/media_getAllIBUInfo', function (req, res) { req.setTimeout(timeout); media_ibu.getAllIBUInfo(req, res) });
router.post('/media_saveIBUInfo', function (req, res) { req.setTimeout(timeout); media_ibu.saveIBUInfo(req, res) });
router.post('/media_updateIBUInfo', function (req, res) { req.setTimeout(timeout); media_ibu.updateIBUInfo(req, res) });
router.post('/media_getAllIBUInfoByIbuId', function (req, res) { req.setTimeout(timeout); media_ibu.getAllIBUInfoByIbuId(req, res) });

// Media Modules Confi api calls
router.get('/media_getModulesConfigList', function (req, res) { req.setTimeout(timeout); media_moduleConfig.getModulesConfigList(req, res) });
router.post('/media_saveModuleConfig', function (req, res) { req.setTimeout(timeout); media_moduleConfig.saveModuleConfig(req, res) });
router.post('/media_updateModuleConfig', function (req, res) { req.setTimeout(timeout); media_moduleConfig.updateModuleConfig(req, res) });
router.post('/media_getModuleConfigInfo', function (req, res) { req.setTimeout(timeout); media_moduleConfig.getModuleConfigInfo(req, res) });
router.post('/media_getModulesConfigInfoBytowerId', function (req, res) { req.setTimeout(timeout); media_moduleConfig.getModulesConfigInfoBytowerId(req, res) });

// Tower location Confi api calls
router.get('/media_getAllTowerLocationInfo', function (req, res) { req.setTimeout(timeout); media_towerLocation.getAllTowerLocationInfo(req, res) });
router.post('/media_saveTowerLocationInfo', function (req, res) { req.setTimeout(timeout); media_towerLocation.saveTowerLocationInfo(req, res) });
router.post('/media_updateTowerLocationInfo', function (req, res) { req.setTimeout(timeout); media_towerLocation.updateTowerLocationInfo(req, res) });

//#################CEP api calls#########################################
//jira api calls
router.post('/cep_login', function (req, res) { req.setTimeout(timeout); cep_jiraApi.jiraLogin(req, res) });
router.post('/cep_getUsersAndToBePlanned', function (req, res) { req.setTimeout(timeout); cep_jiraApi.getUsersAndToBePlannedTaskDetails(req, res) });
router.post('/cep_CEPReport', function (req, res) { req.setTimeout(timeout); cep_jiraApi.generateCEPReport(req, res) });
router.post('/cep_getAllCSDClinetNameFromJIRA', function (req, res) { req.setTimeout(timeout); cep_jiraApi.getAllCSDClinetNameFromJIRA(req, res) });
// user booking api call
router.post('/cep_addBookedUser', function (req, res) { req.setTimeout(timeout); cep_bookeduser.bookedUser(req, res) });
router.post('/cep_deleteBookedUser', function (req, res) { req.setTimeout(timeout); cep_bookeduser.deletBookedUser(req, res) });
router.post('/cep_getUserPlannedData', function (req, res) { req.setTimeout(timeout); cep_bookeduser.getUserPlannedData(req, res) });
router.post('/cep_workload', function (req, res) { req.setTimeout(timeout); cep_bookeduser.getBookedUsersWorkLoadData(req, res) });
router.post('/cep_getAllCSDList', function (req, res) { req.setTimeout(timeout); cep_bookeduser.getAllCSDList(req, res) });
router.post('/cep_bookedUtilizationResource', function (req, res) { req.setTimeout(timeout); cep_bookeduser.getBookedUtilizationResource(req, res) });
router.post('/cep_getSelectedTicketPlannedCount', function (req, res) { req.setTimeout(timeout); cep_bookeduser.getSelectedTicketPlannedCount(req, res) });
router.post('/cep_getUserBookingData', function (req, res) { req.setTimeout(timeout); cep_bookeduser.getUserBookingData(req, res) });
router.post('/cep_getBookings', function (req, res) { req.setTimeout(timeout); cep_bookeduser.getBookings(req, res) });
router.post('/cep_getBookingData', function (req, res) { req.setTimeout(timeout); cep_bookeduser.getBookingData(req, res) });
router.post('/cep_updateBookingHours', function (req, res) { req.setTimeout(timeout); cep_bookeduser.updateBookingHours(req, res) });
// user Logs api call
router.post('/cep_userLogs', function (req, res) { req.setTimeout(timeout); cep_jiraUserLogs.generateUserLogsReport(req, res) });
// user api call
router.post('/cep_assignUser', function (req, res) { req.setTimeout(timeout); cep_users.addResouce(req, res) });
router.post('/cep_updateUser', function (req, res) { req.setTimeout(timeout); cep_users.updationResouce(req, res) });
router.post('/cep_deleteUser', function (req, res) { req.setTimeout(timeout); cep_users.deleteResouce(req, res) });
router.post('/cep_getAllUsers', function (req, res) { req.setTimeout(timeout); cep_users.getAllResouces(req, res) });
// router.get('/fetch', function (req, res) { req.setTimeout(timeout); users.getAllResouceList(req, res) });
router.get('/cep_getAllUserList', function (req, res) { req.setTimeout(timeout); cep_users.getAllResouceList(req, res) });
router.get('/cep_fetchUser', function (req, res) { req.setTimeout(timeout); cep_users.getadminUserDetails(req, res) });
router.get('/cep_getHtmlUsersDetails', function (req, res) { req.setTimeout(timeout); cep_users.getHtmlUsersDetails(req, res) });
router.get('/cep_getStorylineUsersDetails', function (req, res) { req.setTimeout(timeout); cep_users.getStorylineUsersDetails(req, res) });
router.get('/cep_getLectoraUsersDetails', function (req, res) { req.setTimeout(timeout); cep_users.getLectoraUsersDetails(req, res) });
router.post('/cep_utilizationResource', function (req, res) { req.setTimeout(timeout); cep_users.getUtilizationResource(req, res) });
router.post('/cep_getCurrentAvailableUsers', function (req, res) { req.setTimeout(timeout); cep_users.getCurrentAvailableUsers(req, res) });
// user skills api call
router.post('/cep_saveSkillsData', function (req, res) { req.setTimeout(timeout); cep_userSkill.saveSkillsData(req, res) });
router.get('/cep_getSkillDetails', function (req, res) { req.setTimeout(timeout); cep_userSkill.getSkillDetails(req, res) });
router.post('/cep_getUserSkillBySkillId', function (req, res) { req.setTimeout(timeout); cep_userSkill.getUserSkillBySkillId(req, res) });
router.post('/cep_fetchAllSkills', function (req, res) { req.setTimeout(timeout); cep_userSkill.fetchAllSkills(req, res) });
router.get('/cep_fetchSkillData', function (req, res) { req.setTimeout(timeout); cep_userSkill.fetchSkillData(req, res) });
// user history api call
router.post('/cep_getResourcesHistory', function (req, res) { req.setTimeout(timeout); cep_userHistory.getResourcesHistory(req, res) });
// work allocation api call
router.post('/cep_addWorkallocation', function (req, res) { req.setTimeout(timeout); cep_workallocation.addWorkallocation(req, res) });
// send email api call
router.post('/cep_sendEmail', function (req, res) { req.setTimeout(timeout); cep_sendEmails.sendEmail(req, res) });

// progress JIRA api call
router.get('/cep_status', function (req, res) { req.setTimeout(timeout); cep_progressJIRA.publishStatus(req, res) });
router.get('/cep_initStatus', function (req, res) { req.setTimeout(timeout); cep_progressJIRA.init(req, res) });
//End Content Development Team API Calls

app.use('/api', router);
let httpPort = process.env.PORT || property[0].config.httpPort;
let httpsPort = process.env.PORT || property[0].config.httpsPort;
const https = require('https').createServer(options, app);
const http = require('http').createServer(app);
http.listen(httpPort);
https.listen(httpsPort);
console.log('Server started at');
console.log('http://localhost:' + httpPort + '/api');
console.log('https://localhost:' + httpsPort + '/api');

//send emails for media team
media_sendBookingStatusEmail.emaiInit();

//send emails for media team
cep_sendBookingStatusEmail.emaiInit();


