let nodemailer = require('nodemailer');
let emailConfig = require('../../utils/emailConfig.json');

let isSendEmail = false;

// send email for for management users
exports.sendEmailManagementUserRegistration = async function (userInfo) {
	if (!userInfo) {
		return;
	}
	if (isSendEmail) {
		let transporter = nodemailer.createTransport(emailConfig.gmail);
		let mailOptions = emailConfig.mailOptions;
		mailOptions.to = userInfo.userEmail;
		let text = '<html><body style="color: #212529;"><p>Hi ' + userInfo.userFullName + ',</p>';
		text = text + '<h2>Welcome to Squa<span style="color:#92d050">dH</span>ub</h2>';
		text = text + '<span>Please follow the credential of Squadhub login.<br/>';
		text = text + 'UserName: ' + userInfo.userName + '<br/>Password: ' + userInfo.userPassword + '<br/>';
		text = text + 'URL: <a href="http:squadhub.niit.com" target="_blank">http:squadhub.niit.com</a></span>';
		text = text + '<p>Regards, <br/>Squadhub Team</p></body></html>';
		mailOptions.html = text;
		transporter.sendMail(mailOptions, (err, message) => {
			console.log(err, message);
		});
	}
}

