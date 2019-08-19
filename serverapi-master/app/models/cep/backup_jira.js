
// router.get('/getAllIssues', function (req, res) {
//     var jira = getJiraClientConnection(req.body.username, req.body.password);
//     jira.search.search({
//         opts: { jql: 'jql=project%20%3D%20%22CEP%20Service%20Desk%22' }
//     }, function (error, data) {
//         res.json({ 'data': data, 'error': error });
//     });
// });

// // asign issue start
// router.get('/assignIssue', function (req, res) {
//     var jira = getJiraClientConnection(req.body.username, req.body.password);
//     jira.issue.assignIssue({
//         issueId: 13969,
//         issueKey: 'CSD-600',
//         assignee: "	Sandhya Dev"
//     }, function (error, data) {
//         res.json({ 'data': data, 'error': error });
//     });
// });


// // add Comment start
// router.get('/addComment', function (req, res) {
//     var jira = getJiraClientConnection(req.body.username, req.body.password);
//     jira.issue.addComment({
//         issueId: 11572,
//         issueKey: 'CSD-267',
//         comment: "Hello!!!! This is test"
//     }, function (error, data) {
//         res.json({ 'data': data, 'error': error });
//     });
// });
// // add Comment end

// // edit Comment start
// router.get('/editComment', function (req, res) {
//     var jira = getJiraClientConnection(req.body.username, req.body.password);
//     jira.issue.editComment({
//         issueId: 11572,
//         issueKey: 'CSD-267',
//         commentId: 19824,
//         comment: "Hello!!!! This is test"
//     }, function (error, data) {
//         res.json({ 'data': data, 'error': error });
//     });
// });
// // edit Comment end

// // delete Comment
// router.get('/deleteComment', function (req, res) {
//     var jira = getJiraClientConnection(req.body.username, req.body.password);
//     jira.issue.deleteComment({
//         issueId: 11572,
//         issueKey: 'CSD-267',
//         commentId: 19824
//     }, function (error, data) {
//         res.json({ 'data': data, 'error': error });
//     });
// });

// // code to get all projects - start
// router.get('/getAllProjects', function (req, res) {
//     var jira = getJiraClientConnection(req.body.username, req.body.password);
//     jira.project.getAllProjects({
//     }, function (error, project) {
//         console.log("error" + error);
//         console.log(project);
//         res.json({ 'data': project });
//     });
// });
// // code to get all projects - stop

// router.get('/getAllUsers', function (req, res) {
//     var jira = getJiraClientConnection(req.body.username, req.body.password);
//     jira.user.multiProjectSearchAssignable({
//         opts: { projectKeys: 'service_desk' }
//     }, function (error, data) {
//         res.json({ 'data': data, 'error': error });
//     });
// });





// make jira connection.
// jira.project.getProject({
//     projectIdOrKey: 'CSD'
// }, function(error, project) {
//     console.log("error"+ error);
//     console.log(project);
//     res.json({ 'data': project });
// });

// console.log(jira);
//res.json({ 'data': jira });

// code to get single issue by issue-id - start

/* jira.issue.getIssue({
  issueKey: 'ND-656'
}, function(error, issue) {
    console.log("error"+ error);
    console.log(issue);
    res.json({ 'data': issue });
});*/

// code to get single issue by issue-id - stop



// code to get single project by key or id - start
/*  jira.project.getProject({
    projectIdOrKey: '10602'
}, function(error, project) {
    console.log("error"+ error);
    console.log(project);
    res.json({ 'data': project });
});*/
// code to get single project by key or id - stop

/*jira.user.getUser({
     username: 'Admin'
 }, function(error, user) {
     console.log("error"+ error);
     console.log(user);
     res.json({ 'data': user });
 });*/
//});

// function getUsersList(username, password) {
//     var jira = getJiraClientConnection(username, password);
//     jira.user.multiProjectSearchAssignable({
//         projectKeys: ['CSD']
//     }, function (error, usersData) {
//         if (usersData && usersData != null) {
//             for (var i = 0; i < usersData.length; i++) {
//                 jqlStrl += '"' + usersData[i].displayName + '"';
//                 if (i != (usersData.length - 1)) {
//                     jqlStrl += ", "
//                 } else {
//                     jqlStrl += ")"
//                 }
//             }
//         }
//         console.log(jqlStrl)
//         return jqlStrl;
//     });
// }



// async function getAllUsersIssue() {
//     //fetch all project
//     return new Promise(function (resolve, reject) {
//         jira.search.search({
//             startAt: 0,
//             maxResults: 20,
//             jql: jqlStrl
//         }, function (error, data) {
//             var finalData = [];
//             var obj = {};
//             if (data != null) {
//                 var filtered = [];
//                 var filteredString = [];
//                 var filteredUserIssue = [];
//                 for (var i = 0; i < data.issues.length; i++) {
//                     if (data.issues[i].fields.assignee && filteredString.indexOf(data.issues[i].fields.assignee.displayName) < 0) {
//                         filtered.push(data.issues[i]);
//                         filteredString.push(data.issues[i].fields.assignee.displayName);
//                     }
//                 }
//                 for (var i = 0; i < filteredString.length; i++) {
//                     obj = {};
//                     var userIssue = [];
//                     for (var j = 0; j < data.issues.length; j++) {
//                         if (filteredString[i] == (data.issues[j].fields.assignee && data.issues[j].fields.assignee.displayName)) {
//                             userIssue.push(data.issues[i]);
//                         }
//                     }
//                     obj[filteredString[i]] = userIssue;
//                     filteredUserIssue.push({ obj })
//                 }
//                 obj = {};
//                 obj['userIssues'] = filteredUserIssue;
//                 obj['filteredIssues'] = filtered;
//                 finalData.push(obj);
//                 //res.json({ 'data': data.issues, 'error': error });
//                 res.json({ 'data': finalData, 'error': error });
//             } else {
//                 res.json({ 'data': data, 'error': error });
//             }
//         });
//     });
// }


// var transporter = nodemailer.createTransport({
	// 	service: 'gmail',
	// 	auth: {
	// 		user: 'sshuame1@gmail.com',
	// 		pass: 'SeaW0r!dss'
	// 	}

	// 	// host: "https://outlook.office365.com/owa/?realm=in.niit.com", // hostname
	// 	// secureConnection: false, // TLS requires secureConnection to be false
	// 	// port: 587, // port for secure SMTP
	// 	// tls: {
	// 	// 	ciphers: 'SSLv3'
	// 	// },
	// 	// auth: {
	// 	// 	user: 'shahid.husain@in.niit.com',
	// 	// 	pass: 'sep@2018'
	// 	// }
	// });

	// var event = new iCalEvent();
	// event.set('uid', 9873647);
	// event.set('offset', new Date().getTimezoneOffset());
	// event.set('method', 'request');
	// event.set('status', 'confirmed');
	// event.set('attendees', [
	// 	{
	// 		name: 'Shahid',
	// 		email: 'shahid.husain@in.niit.com'
	// 	}
	// ]);
	// event.set('start', '2018-09-01T02:00:00-05:00');
	// event.set('end', '2018-09-30T02:30:00-05:00');
	// event.set('timezone', 'US/Central');
	// event.set('summary', 'Priestly Duties.');
	// event.set('description', 'Home flu visit.');
	// event.set('location', 'Casa');
	// event.set('organizer', { name: 'Nacho Libre', email: 'luchador@monastery.org' });
	// event.set('url', 'http://google.com/search?q=nacho+libre');

	// // array of TO: email strings containing a list of email addresses
	// // var data = {
	// // 	'toEmailList': req.body.emails
	// // }

	// var toEmailList = 'shahid.husain@niit.com';//req.body.emails;
	// var assignee = "Shahid Husain"; //req.body.userData.userData.displayName;
	// var assignTo = "Shahid";///req.body.assignuserData.username;
	// var ticket = 12345; //req.body.assignuserData.issues;
	// var ticket_link = "https://cep.niit.com/browse/" + ticket;
	// // array of CC: email strings containing a list of email addresses
	// var ccEmailList = [];
	// let content = event.toFile();
	// const mailOptions = {
	// 	from: 'qtparas@gmail.com', // sender address
	// 	to: toEmailList, // list of receivers
	// 	cc: ccEmailList,
	// 	subject: ticket, // Subject line
	// 	html: 'Hello ' + assignTo + ', <br /><br /><br />#Ticket <a href="' + ticket_link + '">' + ticket
	// 		+ '</a>' + '<br /> This ticket has assigned by ' + assignee
	// 		+ '<br /><br />Thanks, <br />' + assignee // plain text body,
	// 	, icalEvent: {
	// 		//filename: `${__dirname}/event.ics`,
	// 		method: 'request',
	// 		content: content
	// 	}
	// };

	// transporter.sendMail(mailOptions, function (err, info) {
	// 	if (err)
	// 		console.log(err);
	// 	else
	// 		console.log(info);
	// });

	// SELECT email FROM rts.booked_user where email in (Select email From rts.users Where leave_date is null or leave_date >= '2018-12-12' or leave_date = '');

