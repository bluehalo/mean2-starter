'use strict';

var
	path = require('path'),
	stream = require('stream'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	utilService = deps.utilService,
	logger = deps.logger,
	auditService = deps.auditService,
	csvStream = deps.csvStream,

	exportConfigService = require(path.resolve('./src/server/app/util/services/export-config.server.service.js')),
	User = dbs.admin.model('User'),
	ExportConfig = dbs.admin.model('ExportConfig');

/**
 * Request to generate an export configuration in preparation to serve a CSV download soon. The config document will
 * expire after a number of minutes (see export-config.server.service).
 */

exports.adminRequestCSV = function(req, res) {
	if (null != req.body.config.q) {
		// Stringify the query JSON because '$' is reserved in Mongo.
		req.body.config.q = JSON.stringify(req.body.config.q);
	}
	if (null == req.body.type) {
		return utilService.handleErrorResponse(res, { status: 400, type: 'missing export type', message: 'Missing export type.'});
	}

	exportConfigService.generateConfig(req)
		.then(function(generatedConfig) {
			return auditService.audit(req.body.type +  ' csv config created', 'export', 'create',
				User.auditCopy(req.user),
				ExportConfig.auditCopy(generatedConfig))
				.then(function() {
					return q(generatedConfig);
				});
		})
		.then(function(result) {
			res.status(200).json({ _id: result._id});
		}, function(err) {
			utilService.handleErrorResponse(res, err);
		}).done();
};

/**
 * Generic function to create CSV from data with the requested filename and columns
 */
exports.exportData = function(req, res, filename, columns, data) {

	if (null !== data) {
		// Set up streaming res
		res.set('Content-Type', 'text/csv;charset=utf-8');
		res.set('Content-Disposition', 'attachment;filename=' + filename);
		res.set('Transfer-Encoding', 'chunked');

		// Put into stream the data object
		var s = new stream.Readable({objectMode:true});
		s._read = function() {
			data.forEach(function(row) {
				s.push(row);
			});
			s.push(null);
		};

		var sc = s.pipe(csvStream(columns));

		// Pipe each row to the response
		sc.pipe(res);

		// If an error occurs, close the stream
		s.on('error', function(err) {
			logger.error(err, 'CSV export error occurred');

			// End the download
			res.end();
		});

		// If the client drops the connection, stop processing the stream
		req.on('close', function() {
			logger.info('CSV export aborted because client dropped the connection');
			if (s != null) {
				s.destroy();
			}
			// End the download.
			res.end();
		});
	}
};
