'use strict';

let mongoose = require('mongoose'),
	extend = require('mongoose-schema-extend'),
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService;

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
		get: util.dateParse
	}
}, module.exports.notificationOptions);


/*****************
 * Index declarations
 *****************/

NotificationSchema.index({ user: 1, created: -1 });
NotificationSchema.index({ user: 1, type: 1, created: -1 });

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
