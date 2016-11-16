'use strict';

var _ = require('lodash'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	utilService = deps.utilService,
	auditService = deps.auditService,

	exportConfigController = require(path.resolve('./src/server/app/util/controllers/export-config.server.controller.js')),
	exportConfigService = require(path.resolve('./src/server/app/util/services/export-config.server.service.js')),
	User = dbs.admin.model('User'),
	Group = dbs.admin.model('Group'),
	ExportConfig = dbs.admin.model('ExportConfig');

// GET the requested CSV using a special configuration from the export config collection
exports.adminGetCSV = function (req, res) {
	var exportId = req.params.exportId;

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
				User.auditCopy(req.user),
				ExportConfig.auditCopy(result))
				.then(function () {
					return q(result);
				});
		})
		.then(function (result) {
			var userData = [],
				columns = result.config.cols,
				query = (result.config.q) ? JSON.parse(result.config.q) : null,
				search = result.config.s,
				sortArr = [{property: result.config.sort, direction: result.config.dir}],
				fileName = config.app.instanceName + '-' + result.type + '.csv',
				groupTitleMap = {},
				isGroupRequested = false;

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
					case 'groups':
						isGroupRequested = true;
						break;
				}
			});

			return User.search(query, search, null, null, sortArr)
				.then(function (userResult) {
					// Process user data to be usable for CSV
					userData = (null != userResult.results) ? userResult.results.map(function (user) {
						return User.fullCopy(user);
					}) : [];

					if (!isGroupRequested) return q(null); //No group column included in export
					// Determine which groups are relevant to our user set
					userData.forEach(function (user) {
						user.groups.forEach(function (group) {
							var groupId = group._id.toString();
							if (!groupTitleMap.hasOwnProperty(groupId)) {
								groupTitleMap[groupId] = '';
							}
						});
					});
					return Group.find({_id: {$in: _.keys(groupTitleMap)}}).exec();
				})
				.then(function (groupResults) {
					if (null != groupResults) {
						groupResults.forEach(function (group) {
							groupTitleMap[group._id.toString()] = group.title;
						});

						// Convert user.groups to human readable groups string
						userData.forEach(function (user) {
							var groupsArr = user.groups.map(function(group) {
								var title = groupTitleMap[group._id.toString()];
								return (title)? title : '<missing>';
							});

							// Formatted group string, ex. "Group 1, Test Group"
							user.groups = groupsArr.join(', ');
						});
					}
					exportConfigController.exportData(req, res, fileName, columns, userData);
				});
		}, function (error) {
			utilService.handleErrorResponse(res, error);
		})
		.done();
};
