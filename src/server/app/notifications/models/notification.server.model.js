'use strict';

let mongoose = require('mongoose'),
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	util = deps.utilService,
	schemaService = deps.schemaService;

/**
 * Notification Schema
 */
module.exports.notificationOptions = {discriminatorKey: 'notificationType'};

let NotificationSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'User is required'
	},
	created: {
		type: Date,
		default: Date.now,
		get: util.dateParse,
		expires: config.notificationExpires
	}
}, module.exports.notificationOptions);

/*****************
 * Plugins
 *****************/

NotificationSchema.plugin(schemaService.pageable);

/*****************
 * Index declarations
 *****************/

NotificationSchema.index({ user: 1, created: -1 });

/*****************
 * Static Methods
 *****************/

// Create a filtered copy for auditing
NotificationSchema.statics.auditCopy = function(src) {
	let toReturn = {};
	src = src || {};

	toReturn._id = src._id;
	toReturn.user = src.user;
	toReturn.notificationType = src.notificationType;

	return toReturn;
};

/**
 * Model Registration
 */
mongoose.model('Notification', NotificationSchema, 'notifications');
