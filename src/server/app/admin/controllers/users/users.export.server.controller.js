'use strict';

let _ = require('lodash'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	utilService = deps.utilService,
	auditService = deps.auditService,

	Team = dbs.admin.model('Team'),
	TeamMember = dbs.admin.model('TeamUser'),
	ExportConfig = dbs.admin.model('ExportConfig'),

	exportConfigController = require(path.resolve('./src/server/app/util/controllers/export-config.server.controller.js')),
	exportConfigService = require(path.resolve('./src/server/app/util/services/export-config.server.service.js'));

// GET the requested CSV using a special configuration from the export config collection
exports.adminGetCSV = function (req, res) {
	let exportId = req.params.exportId;

	exportConfigService.getConfigById(exportId)
		.then(function (result) {
			if (null == result) {
				return q.reject({
					status: 404,
					type: 'bad-argument',
					message: 'Export configuration not found. Document may have expired.'
				});
			}
			return auditService.audit(result.type + 'CSV config retrieved', 'export', 'export',
				TeamMember.auditCopy(req.user),
				ExportConfig.auditCopy(result))
				.then(function () {
					return q(result);
				});
		})
		.then(function (result) {
			let userData = [],
				columns = result.config.cols,
				query = (result.config.q) ? JSON.parse(result.config.q) : null,
				search = result.config.s,
				sortArr = [{property: result.config.sort, direction: result.config.dir}],
				fileName = config.app.instanceName + '-' + result.type + '.csv',
				teamTitleMap = {},
				isTeamRequested = false;

			// Based on which columns are requested, handle property-specific behavior (ex. callbacks for the
			// CSV service to make booleans and dates more human-readable)
			columns.forEach(function (col) {
				switch (col.key) {
					case 'roles.user':
					case 'roles.editor':
					case 'roles.auditor':
					case 'roles.admin':
					case 'bypassAccessCheck':
						col.callback = function (value) {
							return (value) ? 'true' : '';
						};
						break;
					case 'lastLogin':
					case 'created':
					case 'updated':
					case 'acceptedEua':
						col.callback = function (value) {
							return (value) ? new Date(value).toISOString() : '';
						};
						break;
					case 'teams':
						isTeamRequested = true;
						break;
				}
			});

			return TeamMember.search(query, search, null, null, sortArr)
				.then(function (userResult) {
					// Process user data to be usable for CSV
					userData = (null != userResult.results) ? userResult.results.map(function (user) {
						return TeamMember.fullCopy(user);
					}) : [];

					if (isTeamRequested) {
						let teamIds = [];
					userData.forEach(function (user) {
							teamIds = teamIds.concat(user.teams.map(function(t) { return t._id; }));
						});
						return Team.find({_id: {$in: teamIds}}).exec();
					}
					else {
						return q();
							}
				})
				.then(function (teamResults) {
					if (null != teamResults) {
						teamTitleMap = _.keyBy(teamResults, '_id');

						// Convert user.groups to human readable groups string
						userData.forEach(function (user) {
							let teamNames = user.teams.map(function(t) {
								return (teamTitleMap.hasOwnProperty(t._id) ? teamTitleMap[t._id].name : '<missing>');
							});

							// Formatted team name string, ex. "Group 1, WildfireDev, Test Group"
							user.teams = teamNames.join(', ');
						});
					}
					exportConfigController.exportData(req, res, fileName, columns, userData);
				});
		}, function (error) {
			utilService.handleErrorResponse(res, error);
		})
		.done();
};
