'use strict';

let
	express = require('express'),
	path = require('path'),

	logger = require(path.posix.resolve('./src/server/lib/bunyan.js')).logger,

	users = require(path.posix.resolve('./src/server/app/admin/controllers/users.server.controller.js')),
	accessChecker = require(path.posix.resolve('./src/server/app/access-checker/controllers/access-checker.server.controller.js'));


/**
 * Routes that only apply to the 'proxy-pki' passport strategy
 */
logger.info('Configuring proxy-pki user authentication routes.');

let router = express.Router();

router.route('/access-checker/entry/:key')
	.post(users.hasAdminAccess, accessChecker.refreshEntry)
	.delete(users.hasAdminAccess, accessChecker.deleteEntry);

router.route('/access-checker/entries/search')
	.post(users.hasAdminAccess, accessChecker.searchEntries);

router.route('/access-checker/entries/match')
	.post(users.hasAdminAccess, accessChecker.matchEntries);

// Refresh current user
router.route('/access-checker/user')
	.post(users.has(users.requiresLogin), accessChecker.refreshCurrentUser);

module.exports = router;
