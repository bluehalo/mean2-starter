'use strict';

let mongoose = require('mongoose'),

	ValidationError = mongoose.Error.ValidationError,
	path = require('path'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	dbs = deps.dbs,
	logger = deps.logger,
	auditService = deps.auditService,
	util = deps.utilService,
	publishProvider = require(path.resolve(config.publishProvider)),
	User = dbs.admin.model('User'),
	Message = dbs.admin.model('Message');

function copyMutableFields(dest, src) {
	['title', 'type', 'body', 'tearline'].forEach((key) => {
		if (null != src[key]) {
			dest[key] = src[key];
		}
	});
}

// Given a message save to mongo and send update to storm
function save(message, user, res, audit) {
	let error = new ValidationError(message);

	if (!error.errors || Object.keys(error.errors).length === 0) {
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
 * Publish
 */
function publish(destination, message, retry) {
	return publishProvider.publish(destination, message, retry);
}

/**
 * Publish a message
 *
 * @param {Message} message The message to be published
 * @returns {Promise} A promise that is resolved when the send is successful.
 */
function sendMessage(message) {
	// Turn Mongo models into regular objects before we serialize
	if (null != message && null != message.toObject) {
		message = message.toObject();
	}

	let wp = {
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
	let destination = config.messages.topic;
	return publish(destination, wp, true);
}

// Create
exports.create = function(req, res) {
	let message = new Message(req.body);
	message.creator = req.user;
	message.created = Date.now();
	message.updated = Date.now();

	save(message, req.user, res, function() {
		// Audit creation of messages
		auditService.audit('message created', 'message', 'create',
			User.auditCopy(req.user, util.getHeaderField(req.headers, 'x-real-ip')),
			Message.auditCopy(message), req.headers);

		// Publish message
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
	let message = req.message;

	// Make a copy of the original deck for a "before" snapshot
	let originalMessage = Message.auditCopy(message);

	// Update the updated date
	message.updated = Date.now();

	copyMutableFields(message, req.body);

	// Save
	save(message, req.user, res, function() {
		// Audit the save action
		auditService.audit('message updated', 'message', 'update',
			User.auditCopy(req.user, util.getHeaderField(req.headers, 'x-real-ip')),
			{ before: originalMessage, after: Message.auditCopy(message) }, req.headers);
	});
};

// Delete
exports.delete = function(req, res) {
	let message = req.message;
	Message.remove({_id: message._id}, function(err) {
		util.catchError(res, err, function() {
			res.status(200).json(message);
		});
	});

	// Audit the message delete attempt
	auditService.audit('message deleted', 'message', 'delete',
		User.auditCopy(req.user, util.getHeaderField(req.headers, 'x-real-ip')),
		Message.auditCopy(req.message), req.headers);

};


// Search - with paging and sorting
exports.search = function(req, res) {
	// Handle the query/search/page
	let query = req.body.q;
	let search = req.body.s;

	let page = req.query.page;
	let size = req.query.size;
	let sort = req.query.sort;
	let dir = req.query.dir;

	// Limit has to be at least 1 and no more than 100
	if(null == size){ size = 20; }
	size = Math.max(1, Math.min(100, size));

	// Page needs to be positive and has no upper bound
	if(null == page){ page = 0; }
	page = Math.max(0, page);

	// Sort can be null, but if it's non-null, dir defaults to DESC
	if(null != sort && dir == null){ dir = 'DESC'; }

	// Create the variables to the search call
	let limit = size;
	let offset = page*size;
	let sortArr;
	if(null != sort){
		sortArr = [{ property: sort, direction: dir }];
	}

	Message.search(query, search, limit, offset, sortArr).then(function(result){

		// Create the return copy of the messages
		let messages = [];
		result.results.forEach(function(element){
			messages.push(Message.fullCopy(element));
		});

		// success
		let toReturn = {
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
	let query = req.body.q || {};
	let search = req.body.s;

	if (search) {
		query = { '$and': [ query, { title_lowercase: new RegExp(search, 'i') } ] };
	}

	let page = req.query.page;
	let size = req.query.size;
	let sort = req.query.sort;
	let dir = req.query.dir;

	// Limit has to be at least 1 and no more than 100
	if (null == size){ size = 20; }
	size = Math.max(1, Math.min(100, size));

	// Page needs to be positive and has no upper bound
	if (null == page){ page = 0; }
	page = Math.max(0, page);

	// Sort can be null, but if it's non-null, dir defaults to DESC
	if (null != sort && dir == null){ dir = 'ASC'; }

	// Create the variables to the search call
	let limit = size;
	let sortParams;
	if (null != sort) {
		sortParams = {};
		sortParams[sort] = dir === 'ASC' ? 1 : -1;
	}

	// If we aren't an admin, we need to constrain the results
	let searchPromise = Message.countSearch(query, sortParams, page, limit);

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
