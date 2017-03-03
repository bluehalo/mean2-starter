'use strict';

let
	express = require('express'),
	path = require('path'),

	core = require(path.posix.resolve('./src/server/app/core/controllers/core.server.controller.js'));


let router = express.Router();

// Root routing
router.route('/').get(core.index);

module.exports = router;
