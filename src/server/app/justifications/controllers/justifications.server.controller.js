'use strict';

let
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	util = deps.utilService,
	Justification = dbs.admin.model('Justification'),
	justificationsService = require(path.resolve('./src/server/app/justifications/services/justifications.server.service.js'))();


module.exports.create = (req, res) => {
	justificationsService.createJustification(req.body)
		.then(
			(result) => {
				res.status(200).json(result);
			},
			(err) => {
				util.handleErrorResponse(res, err);
			})
		.done();
};

module.exports.read = (req, res) => {
	res.status(200).json(req.justification);
};

module.exports.touch = (req, res) => {
	justificationsService.touchJustification(req.justification)
		.then(
			(result) => {
				res.status(200).json(result);
			},
			(err) => {
				util.handleErrorResponse(res, err);
			})
		.done();
};

module.exports.search = (req, res) => {
	let search = req.body.s || null;
	let query = req.body.q || {};
	query = util.toMongoose(query);

	justificationsService.searchJustifications(search, query, req.query, req.user)
		.then(
			(result) => {
				res.status(200).json(result);
			},
			(err) => {
				util.handleErrorResponse(res, err);
			})
		.done();
};

module.exports.justificationById = (req, res, next, id) => {
	Justification.findOne({_id: id}).exec()
		.then(
			(justification) => {
				if (null == justification) {
					next(new Error('Could not find justification: ' + id));
				}
				else {
					req.justification = justification;
					next();
				}
			}, next);
};