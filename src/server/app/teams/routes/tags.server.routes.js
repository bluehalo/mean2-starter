'use strict';

let
	express = require('express'),
	path = require('path'),

	tags = require(path.posix.resolve('./src/server/app/teams/controllers/tags.server.controller.js')),
	users = require(path.posix.resolve('./src/server/app/admin/controllers/users.server.controller.js'));


/**
 * Tag Routes
 */

let router = express.Router();

router.route('/tag')
	.put(users.hasAccess, users.hasAny(users.requiresAdminRole, tags.requiresEditor), tags.create);

router.route('/tags')
	.post(users.hasAccess, tags.search);

router.route('/tag/:tagId')
	.get(   users.hasAccess, users.hasAny(users.requiresAdminRole, tags.requiresMember), tags.read)
	.post(  users.hasAccess, users.hasAny(users.requiresAdminRole, tags.requiresEditor), tags.update)
	.delete(users.hasAccess, users.hasAny(users.requiresAdminRole, tags.requiresEditor), tags.delete);


// Finish by binding the tag middleware
router.param('tagId', tags.tagById);

module.exports = router;
