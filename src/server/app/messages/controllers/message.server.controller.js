'use strict';

var mongoose = require('mongoose'),
	q = require('q'),

	ValidationError = mongoose.Error.ValidationError,
	path = require('path'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	logger = deps.logger,
	auditService = deps.auditService,
	util = deps.utilService,
	publishProvider = require(path.resolve(config.messages.publishProvider)),
	User = dbs.admin.model('User'),
	Message = dbs.admin.model('Message');

function copyMutableFields(dest, src) {
	['title', 'type', 'body', 'tearline'].forEach(function(key) {
		if (null != src[key]) {
			dest[key] = src[key];
		}
	});
}

//Given a message save to mongo and send update to storm
function save(message, user, res, audit) {
	var error = new ValidationError(message);

	if(!error.errors || Object.keys(error.errors).length === 0) {
		message.save(function (err, result) {
			util.catchError(res, err, function () {
				res.status(200).json(result);
				audit();
			});
		});
	} else {
		util.send400Error(res, error.group);
	}
}


/**
 * Publish via Kafka
 */
function publish(destination, message, retry) {
	return publishProvider.publish(destination, message, retry);
}

/**
 * Publish a message
 *
 * @param {Message} message The message to be published
 * @returns {Promise} A promise that is resolved when the send to Kafka is successful.
 */
function sendMessage(message) {
	// Turn Mongo models into regular objects before we serialize
	if (null != message && null != message.toObject) {
		message = message.toObject();
	}

	var wp = {
		wrappedPayload: {
			o: config.app.instanceName,
			d: config.app.instanceName,
			t: 'message',
			p: {
				type: 'message',
				id: message._id.toString(),
				time: Date.now(),
				message: message
			}
		}
	};
	var destination = 'message.posted';
	return publish(destination, wp, true);
}

// Create
exports.create = function(req, res) {
	var message = new Message(req.body);
	message.creator = req.user;
	message.created = Date.now();
	message.updated = Date.now();

	save(message, req.user, res, function() {
		// Audit creation of messages
		auditService.audit('message created', 'message', 'create',
			User.auditCopy(req.user),
			Message.auditCopy(message));

		// Publish message over kafka
		sendMessage(message);
	});
};

// Read
exports.read = function(req, res) {
	res.status(200).json(req.message);
};

// Update
exports.update = function(req, res) {
	// Retrieve the message from persistence
	var message = req.message;

	// Make a copy of the original deck for a "before" snapshot
	var originalMessage = Message.auditCopy(message);

	// Update the updated date
	message.updated = Date.now();

	copyMutableFields(message, req.body);

	// Save
	save(message, req.user, res, function() {
		// Audit the save action
		var type = 'message';
		auditService.audit(type + ' updated', type, 'update',
			User.auditCopy(req.user),
			{ before: originalMessage, after: Message.auditCopy(message) });
	});
};

// Delete
exports.delete = function(req, res) {
	var message = req.message;
	Message.remove({_id: message._id}, function(err) {
		util.catchError(res, err, function() {
			res.status(200).json(message);
		});
	});

	// Audit the message delete attempt
	var type = 'message';
	auditService.audit(type + ' deleted', type, 'delete',
		User.auditCopy(req.user),
		Message.auditCopy(req.message));

};


// Search - with paging and sorting
exports.search = function(req, res) {
	// Handle the query/search/page
	var query = req.body.q;
	var search = req.body.s;

	var page = req.query.page;
	var size = req.query.size;
	var sort = req.query.sort;
	var dir = req.query.dir;

	// Limit has to be at least 1 and no more than 100
	if(null == size){ size = 20; }
	size = Math.max(1, Math.min(100, size));

	// Page needs to be positive and has no upper bound
	if(null == page){ page = 0; }
	page = Math.max(0, page);

	// Sort can be null, but if it's non-null, dir defaults to DESC
	if(null != sort && dir == null){ dir = 'DESC'; }

	// Create the variables to the search call
	var limit = size;
	var offset = page*size;
	var sortArr;
	if(null != sort){
		sortArr = [{ property: sort, direction: dir }];
	}

	Message.search(query, search, limit, offset, sortArr).then(function(result){

		// Create the return copy of the messages
		var messages = [];
		result.results.forEach(function(element){
			messages.push(Message.fullCopy(element));
		});

		// success
		var toReturn = {
			totalSize: result.count,
			pageNumber: page,
			pageSize: size,
			totalPages: Math.ceil(result.count/size),
			elements: messages
		};

		// Serialize the response
		res.status(200).json(toReturn);
	}, function(error){
		// failure
		logger.error(error);
		return util.send400Error(res, error);
	});

};

// Search - with paging and sorting
exports.searchTest = function(req, res) {
	var query = req.body.q || {};
	var search = req.body.s;

	if (search) {
		query = { '$and': [ query, { title_lowercase: new RegExp(search, 'i') } ] };
	}

	var page = req.query.page;
	var size = req.query.size;
	var sort = req.query.sort;
	var dir = req.query.dir;

	// Limit has to be at least 1 and no more than 100
	if (null == size){ size = 20; }
	size = Math.max(1, Math.min(100, size));

	// Page needs to be positive and has no upper bound
	if (null == page){ page = 0; }
	page = Math.max(0, page);

	// Sort can be null, but if it's non-null, dir defaults to DESC
	if (null != sort && dir == null){ dir = 'ASC'; }

	// Create the variables to the search call
	var limit = size;
	var offset = page*size;
	var sortParams;
	if (null != sort) {
		sortParams = {};
		sortParams[sort] = dir === 'ASC' ? 1 : -1;
	}

	var doSearch = function(query) {
		var getSearchCount = Message.find(query).count();
		var getSearchInfo = Message.find(query).sort(sortParams).skip(offset).limit(limit);

		return q.all([getSearchCount, getSearchInfo])
			.then(function(results) {
				return q({
					totalSize: results[0],
					pageNumber: page,
					pageSize: size,
					totalPages: Math.ceil(results[0]/size),
					elements: results[1]
				});
			});
	};


	// If we aren't an admin, we need to constrain the results
	var searchPromise = doSearch(query);

	// Now execute the search promise
	searchPromise.then(function(results) {
		res.status(200).json(results);
	}, function(err) {
		logger.error({err: err, req: req}, 'Error searching for messages');
		return util.handleErrorResponse(res, err);
	}).done();

};

/**
 * Message middleware
 */
exports.messageById = function(req, res, next, id) {
	Message.findOne({ _id: id })
		.exec(function(err, message) {
			if (err) return next(err);
			if (!message) return next(new Error('Failed to load message ' + id));
			req.message = message;
			next();
		});
};

module.exports.sendMessage = sendMessage;
