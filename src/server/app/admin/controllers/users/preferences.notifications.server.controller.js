'use strict';

let
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
exports.getNotificationPreferencesByTypeAndId = (req, res) => {

	let userId = req.user._id,
		notificationType = req.params.notificationType,
		referenceId = req.params.referenceId;

	User.findOne(
		{
			_id: userId,
			'preferences.notifications.notificationType': notificationType,
			'preferences.notifications.referenceId' : referenceId
		},
		{ 'preferences.notifications.$': 1 },
		(error, doc) => {
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
exports.setNotificationPreferencesByTypeAndId = (req, res) => {

	let user = req.user;

	let notificationType = req.params.notificationType,
		referenceId = req.params.referenceId;

	let np = new NotificationPreference({
		notificationType: notificationType,
		referenceId: referenceId,
		values: req.body
	});

	user.updateNotificationPreference(np).then(() => {
		res.json({ success: true });
	}, (err) => {
		logger.error(err);
		return util.send400Error(res, err);
	});

};
