'use strict';

let path = require('path'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	notificationsService = require(path.resolve('./src/server/app/notifications/services/notification.server.service.js'));

module.exports.search = function(req, res) {
	// Get search and query parameters
	let query = req.body.q || {};

	notificationsService.search(query, req.query, req.user)
		.then(
			(result) => {
				res.status(200).json(result);
			},
			(err) => {
				util.handleErrorResponse(res, err);
			})
		.done();
};
