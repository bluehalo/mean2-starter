'use strict';

const express = require('express'),
	path = require('path'),

	core = require(path.posix.resolve('./src/server/app/core/controllers/core.server.controller.js')),
	users = require(path.posix.resolve('./src/server/app/admin/controllers/users.server.controller.js'));


let router = express.Router();

// Root routing
router.route('/').get(core.index);

router.route('/feedback')
	.post(users.hasAccess, core.submitFeedback);

router.route('/admin/feedback/csv/:exportId')
	.get(users.hasAdminAccess, core.adminGetFeedbackCSV);

module.exports = router;
