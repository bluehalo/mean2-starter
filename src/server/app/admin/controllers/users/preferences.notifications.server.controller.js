'use strict';

var
	path = require('path'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	util = deps.utilService,
	logger = deps.logger,

	User = dbs.admin.model('User'),
	NotificationPreference = dbs.admin.model('NotificationPreference');


/*******
 * Standard Operations
 ******* */

/**
 * Retrieve the Notification Preferences for this User for a Type and ID
 */
exports.getNotificationPreferencesByTypeAndId = function(req, res) {

	var userId = req.user._id,
		notificationType = req.params.notificationType,
		referenceId = req.params.referenceId;

	User.findOne(
		{
			_id: userId,
			'preferences.notifications.notificationType': notificationType,
			'preferences.notifications.referenceId' : referenceId
		},
		{ 'preferences.notifications.$': 1 },
		function(error, doc) {
			if(error) {
				return util.send400Error(res, error);
			}

			if(null != doc) {
				res.json(doc.preferences.notifications[0].values);
			}
			else {
				// default
				res.json({ email: false, sms: false });
			}

		});

};


/**
 * Set the Notification Preferences for this User for a Type and ID
 */
exports.setNotificationPreferencesByTypeAndId = function(req, res) {

	var user = req.user;

	var notificationType = req.params.notificationType,
		referenceId = req.params.referenceId;

	var np = new NotificationPreference({
		notificationType: notificationType,
		referenceId: referenceId,
		values: req.body
	});

	user.updateNotificationPreference(np).then(function() {
		res.json({ success: true });
	}, function(err) {
		logger.error(err);
		return util.send400Error(res, err);
	});

};
