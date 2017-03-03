'use strict';

let
	express = require('express'),
	path = require('path'),

	config = require(path.posix.resolve('./src/server/app/core/controllers/config.server.controller.js'));


let router = express.Router();

// For now, just a single get for the global client configuration
router.route('/config')
	.get(config.read);

module.exports = router;
