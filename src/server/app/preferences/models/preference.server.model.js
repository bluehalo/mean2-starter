'use strict';

let mongoose = require('mongoose'),
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService,
	schemaService = deps.schemaService;

/**
 * Preference Schema
 */
module.exports.preferenceOptions = {discriminatorKey: 'preferenceType'};

let PreferenceSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'User is required'
	},
	created: {
		type: Date,
		default: Date.now,
		get: util.dateParse
	},
	updated: {
		type: Date,
		default: Date.now,
		get: util.dateParse
	}
}, module.exports.preferenceOptions);

/*****************
 * Plugins
 *****************/

PreferenceSchema.plugin(schemaService.pageable);

/*****************
 * Index declarations
 *****************/

PreferenceSchema.index({ user: 1, updated: -1 });
PreferenceSchema.index({ user: 1, preferenceType: 1, updated: -1 });

/*****************
 * Static Methods
 *****************/

// Create a filtered copy for auditing
PreferenceSchema.statics.auditCopy = function(src) {
	let toReturn = {};
	src = src || {};

	toReturn._id = src._id;
	toReturn.user = src.user;
	toReturn.preferenceType = src.preferenceType;

	return toReturn;
};

/**
 * Model Registration
 */
mongoose.model('Preference', PreferenceSchema, 'preferences');
