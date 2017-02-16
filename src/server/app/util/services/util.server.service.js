'use strict';

var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	platform = require('platform'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	errorHandler = deps.errorHandler,
	logger = deps.logger;

function getValidationErrors(err) {
	var errors = [];

	if(null != err.errors) {
		for (var field in err.errors) {
			if(err.errors[field].path) {
				var message = (err.errors[field].type === 'required')? field + ' is required' : err.errors[field].message;
				errors.push({ field: field, message: message });
			}
		}
	}

	return errors;
}

module.exports.getErrorMessage = function(err) {
	if(typeof err === 'string') {
		return err;
	}

	var msg = 'unknown error';
	if(null != err.message) {
		msg = err.message;
	}

	if(null != err.stack) {
		msg = '[' + msg + '] ' + err.stack;
	}

	return msg;
};

module.exports.getClientErrorMessage = function(err) {
	if(config.exposeServerErrors) {
		return module.exports.getErrorMessage(err);
	} else {
		return 'A server error has occurred.';
	}
};

module.exports.handleErrorResponse = function(res, errorResult) {
	// Return the error state to the client, defaulting to 500
	errorResult = errorResult || {};

	if(errorResult.name === 'ValidationError') {
		var errors = getValidationErrors(errorResult);
		errorResult = {
			status: 400,
			type: 'validation',
			message: errors.map(function(e) { return e.message; }).join(', '),
			errors: errors
		};
	}

	// If the status is missing or invalid, default to 500
	if(!(errorResult.status >= 400 && errorResult.status <= 600)) {
		errorResult.status = 500;
	}

	// If it's a server error, get the client message
	if(errorResult.status >= 500 && errorResult.status < 600) {
		errorResult = {
			status: errorResult.status,
			type: 'server-error',
			message: module.exports.getClientErrorMessage(errorResult.message)
		};
	}

	// Send the response
	res.status(errorResult.status).json(errorResult);
};

module.exports.catchError = function(res, err, callback) {
	if (err) {
		logger.error(err);
		return this.send400Error(res, err);
	} else if (null != callback) {
		callback();
	}
};

module.exports.send400Error = function (res, err) {
	return res.status(400).json({
		message: errorHandler.getErrorMessage(err)
	});
};

module.exports.send403Error = function (res) {
	return res.status(403).json({
		message: 'User is not authorized'
	});
};

module.exports.validateNonEmpty = function (property) {
	return (null != property && property.length > 0);
};

module.exports.validateArray = function (arr) {
	return (null != arr && arr.length > 0);
};

module.exports.toLowerCase = function (v){
	return (null != v)? v.toLowerCase(): undefined;
};

/**
 * Parse an input as a date. Handles various types
 * of inputs, such as Strings, Date objects, and Numbers.
 *
 * @param {date} The input representing a date / timestamp
 * @returns The timestamp in milliseconds since the Unix epoch
 */
module.exports.dateParse = function (date) {

	// Handle nil values by simply returning null
	if (_.isNil(date)) {
		return null;
	}

	// Date object should return its time in milliseconds
	if (_.isDate(date)) {
		return date.getTime();
	}

	// A number that exists will be interpretted as millisecond
	if (_.isFinite(date)) {
		return date;
	}

	// Handle String, Object, etc.
	return Date.parse(date);
};

/**
 * Get the limit provided by the user, if there is one.
 * Limit has to be at least 1 and no more than 100.
 *
 * @param queryParams
 * @param maxSize (optional)
 * @returns {number}
 */
module.exports.getLimit = function (queryParams, maxSize) {
	let max = maxSize || 100;
	let limit = Math.floor(queryParams.size);
	if (null == limit || isNaN(limit)) {
		limit = 20;
	}
	return Math.max(1, Math.min(max, limit));
};

/**
 * Page needs to be positive and has no upper bound
 * @param queryParams
 * @returns {number}
 */
module.exports.getPage = function (queryParams) {
	let page = queryParams.page || 0;
	return Math.max(0, page);
};

/**
 * Extract given field from request header
 */
module.exports.getHeaderField = function (header, fieldName) {
	return (null == header || null == header[fieldName]) ? null : header[fieldName];
};

/**
 * Parses user agent information from request header
 */
module.exports.getUserAgentFromHeader = function(header) {
	let userAgent = this.getHeaderField(header, 'user-agent');

	let data = {};
	if (null != userAgent) {
		let info = platform.parse(userAgent);
		data = {
			browser: `${info.name} ${info.version}`,
			os: info.os.toString()
		};
	}

	return data;
};

function propToMongoose(prop, nonMongoFunction) {
	if (typeof prop === 'object' && prop.$date != null && typeof prop.$date === 'string') {
		return new Date(prop.$date);
	} else if (typeof prop === 'object' && prop.$obj != null && typeof prop.$obj === 'string') {
		return mongoose.Types.ObjectId(prop.$obj);
	}

	if (null != nonMongoFunction) {
		return nonMongoFunction(prop);
	}

	return null;
}

function toMongoose(obj) {
	if (null != obj) {
		if (typeof obj === 'object') {
			if (Array.isArray(obj)) {
				var arr = [];

				for (var index in obj) {
					arr.push(propToMongoose(obj[index], toMongoose));
				}

				return arr;
			} else {
				var newObj = {};

				for (var prop in obj) {
					newObj[prop] = propToMongoose(obj[prop], toMongoose);
				}

				return newObj;
			}
		}
	}

	return obj;
}

exports.toMongoose = toMongoose;

/**
 * Determine if an array contains a given element by doing a deep comparison.
 * @param arr
 * @param element
 * @returns {boolean} True if the array contains the given element, false otherwise.
 */
module.exports.contains = function(arr, element) {
	for (var i = 0; i < arr.length; i++) {
		if (_.isEqual(element, arr[i])) {
			return true;
		}
	}
	return false;
};

module.exports.toProvenance = function(user) {
	let now = new Date();
	return {
		username: user.username,
		org: user.organization,
		created: now.getTime(),
		updated: now.getTime()
	};
};

module.exports.emailMatcher = /.+\@.+\..+/;

module.exports.mongooseToObject = function(doc) {
	if (doc.constructor.name === 'model') {
		return doc.toObject();
	}
	return doc;
};
