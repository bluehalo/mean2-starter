'use strict';

var path = require('path').posix,

	config = require(path.resolve('./src/server/app/core/controllers/config.server.controller.js'));

exports.index = function(req, res) {
	var user = (null != req.user) ? req.user : {};

	var cfg = config.getSystemConfig();
	cfg = (null != cfg) ? cfg : {};

	res.render('index', {
		user: JSON.stringify(user),
		config: JSON.stringify(cfg)
	});
};
