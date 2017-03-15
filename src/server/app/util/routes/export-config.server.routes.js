'use strict';


let
	express = require('express'),
	path = require('path'),

	users = require(path.posix.resolve('./src/server/app/admin/controllers/users.server.controller.js')),
	exportConfig = require(path.posix.resolve('./src/server/app/util/controllers/export-config.server.controller.js'));


let router = express.Router();

// Admin post CSV config parameters
router.route('/requestExport')
	.post(users.hasAccess, exportConfig.requestExport);

module.exports = router;
