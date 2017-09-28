'use strict';

const path = require('path'),
	fs = require('fs'),
	q = require('q'),
	handlebars = require('handlebars'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	configController = require(path.resolve('./src/server/app/core/controllers/config.server.controller.js')),

	exportConfigController = require(path.resolve('./src/server/app/util/controllers/export-config.server.controller.js')),
	exportConfigService = require(path.resolve('./src/server/app/util/services/export-config.server.service.js')),

	dbs = deps.dbs,
	config = deps.config,
	auditService = deps.auditService,
	emailService = deps.emailService,
	utilService = deps.utilService,

	Audit = dbs.admin.model('Audit'),
	User = dbs.admin.model('User'),
	ExportConfig = dbs.admin.model('ExportConfig');

exports.index = function(req, res) {
	const user = (null != req.user) ? req.user : {};

	let cfg = configController.getSystemConfig();
	cfg = (null != cfg) ? cfg : {};

	res.render('index', {
		user: JSON.stringify(user),
		config: JSON.stringify(cfg)
	});
};

function buildEmailContent(user, feedback, url) {
	let defer = q.defer();

	let emailData = {
		appName: config.app.name,
		name: user.name,
		username: user.username,
		url: url,
		feedback: feedback
	};

	fs.readFile('src/server/app/core/views/templates/user-feedback-email.server.view.html', 'utf-8', (error, source) => {
		if (error) {
			defer.reject(error);
		} else {
			let template = handlebars.compile(source);
			let emailHTML = template(emailData);

			defer.resolve(emailHTML);
		}
	});

	return defer.promise;
}

function sendFeedback(user, feedback, url) {
	if (null == user || null == feedback || null == url) {
		return q.reject({ status: 400, message: 'Invalid submission.' });
	}

	return buildEmailContent(user, feedback, url).then((content) => {
		let mailOptions = {
			bcc: config.contactEmail,
			from: config.mailer.from,
			replyTo: config.mailer.from,
			subject: `${config.app.title}: Feedback Submitted`,
			html: content
		};

		return emailService.sendMail(mailOptions);
	});
}

exports.submitFeedback = function(req, res) {
	const feedback = req.body.body || null;
	const url = req.body.url || null;

	return auditService.audit('Feedback submitted', 'feedback', 'create', User.auditCopy(req.user, utilService.getHeaderField(req.headers, 'x-real-ip')), req.body, req.headers).then(() => {
		return sendFeedback(req.user, feedback, url);
	}).then((result) => {
		res.status(200).json(result);
	}, (err) => {
		utilService.handleErrorResponse(res, err);
	}).done();
};

exports.adminGetFeedbackCSV = function(req, res) {
	let exportFileName;
	const exportId = req.params.exportId;

	const dateCallback = (value) => (value) ? new Date(value).toISOString(): '';
	const defaultCallback = (value) => (value) ? value : '';

	const exportColumns = [
		{ key: 'audit.object.url', title: 'Submitted From URL', callback: defaultCallback },
		{ key: 'audit.object.body', title: 'Feedback Body', callback: defaultCallback },
		{ key: 'audit.actor.name', title: 'Submitted By Name', callback: defaultCallback },
		{ key: 'audit.actor.username', title: 'Submitted By Username', callback: defaultCallback },
		{ key: 'audit.actor.email', title: 'Submitted By Email', callback: defaultCallback },
		{ key: 'audit.actor.organization', title: 'Submitted By Organization', callback: defaultCallback },
		{ key: 'created', title: 'Submit Date', callback: dateCallback }
	];

	exportConfigService.getConfigById(exportId).then((result) => {
		if (null == result) {
			return q.reject({ status: 404, type: 'bad-argument', message: 'Export configuration not found. Document may have expired.' });
		}

		exportFileName = `${config.app.instanceName}-${result.type}.csv`;

		return auditService.audit(`${result.type} CSV config retrieved`, 'export', 'export',
			User.auditCopy(req.user, utilService.getHeaderField(req.headers, 'x-real-ip')),
			ExportConfig.auditCopy(result), req.headers).then(() => {
			return q(result);
		});
	}).then((result) => {
		const query = (result.config.q) ? JSON.parse(result.config.q) : null;
		const sortArr = [{property: result.config.sort, direction: result.config.dir}];

		return Audit.search(query, null, null, null, sortArr);
	}).then((feedbackResult) => {
		exportConfigController.exportCSV(req, res, exportFileName, exportColumns, feedbackResult.results);
	}, (error) => {
		utilService.handleErrorResponse(res, error);
	}).done();
};
