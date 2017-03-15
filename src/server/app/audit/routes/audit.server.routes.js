'use strict';

let
	express = require('express'),
	path = require('path'),

	users = require(path.posix.resolve('./src/server/app/admin/controllers/users.server.controller.js')),
	auditController = require(path.posix.resolve('./src/server/app/audit/controllers/audit.server.controller.js'));


let router = express.Router();

router.route('/audit')
	.post(users.hasAuditorAccess, auditController.search);

router.route('/audit/distinctValues')
	.get(users.hasAuditorAccess, auditController.getDistinctValues);

module.exports = router;
