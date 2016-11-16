'use strict';

var _ = require('lodash'),
	mongoose = require('mongoose'),
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	utilService = deps.utilService,
	GetterSchema = deps.schemaService.GetterSchema;

var ExportConfigSchema = new GetterSchema({
	type: {
		type: String,
		trim: true,
		default: '',
		required: 'Type is required'
	},

	config: {
		type: {},
		required: 'Configuration is required'
	},

	created: {
		type: Date,
		expires: 300,
		default: Date.now,
		get: utilService.dateParse,
		required: 'Created date is required'
	}
});

ExportConfigSchema.statics.auditCopy = function(exportConfig) {
	var toReturn = {};
	exportConfig = exportConfig || {};

	toReturn._id = exportConfig._id;
	toReturn.type = exportConfig.type;
	toReturn.config = _.cloneDeep(exportConfig.config);

	return toReturn;
};

/**
 * Model Registration
 */
mongoose.model('ExportConfig', ExportConfigSchema);
