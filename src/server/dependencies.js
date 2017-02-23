'use strict';

let path
	= require('path').posix;

// Main config module
module.exports.config = require(path.resolve('./src/server/config.js'));

// Logging and Auditing
module.exports.logger      = require(path.resolve('./src/server/lib/bunyan.js')).logger;
module.exports.auditLogger = require(path.resolve('./src/server/lib/bunyan.js')).auditLogger;

// Access to the MongoDB db objects
module.exports.dbs = require(path.resolve('./src/server/lib/mongoose.js')).dbs;

// Kafka
module.exports.kafkaProducer = require(path.resolve('./src/server/lib/kafka-producer'));
module.exports.kafkaConsumer = require(path.resolve('./src/server/lib/kafka-consumer'));

// Socket IO
module.exports.socketIO = require(path.resolve('./src/server/lib/socket.io.js'));

// Core Controllers
module.exports.auditService  = require(path.resolve('./src/server/app/audit/services/audit.server.service.js'));
module.exports.errorHandler  = require(path.resolve('./src/server/app/core/controllers/errors.server.controller.js'));
module.exports.queryService  = require(path.resolve('./src/server/app/util/services/query.server.service.js'));
module.exports.utilService   = require(path.resolve('./src/server/app/util/services/util.server.service.js'));
module.exports.schemaService = require(path.resolve('./src/server/app/util/services/schema.server.service.js'));
module.exports.csvStream     = require(path.resolve('./src/server/app/util/services/csv-stream.server.service.js'));
module.exports.delayedStream = require(path.resolve('./src/server/app/util/services/delayed-stream.server.service.js'));
module.exports.emailService  = require(path.resolve('./src/server/app/util/services/email.server.service.js'));
