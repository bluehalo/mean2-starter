'use strict';

var through2 = require('through2'),
	path = require('path').posix,
	stringify = require('csv-stringify'),
	jsonpath = require('JSONPath'),
	pipe = require('multipipe'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	logger = deps.logger;

/**
 * Creates a stream that accepts objects as input and returns a serialized CSV file.
 * The objects in the stream can come directly from Mongo.
 *
 * @param {Array{Object}} columns An array defining the columns to output in the CSV, in order.
 *   Each object must contain:
 *     - key: A JSONPath selector to get the value for this column from the object
 *     - title: The title to use in the CSV header for the column
 *     - callback: Optionally, a function to do further processing of the value.  It must accept a value
 *         and return a value.
 *
 * @returns {Stream} A stream that can be piped to the HTTP response.
 */
module.exports = function(columns) {

	// Create a stream to turn Mongo records into CSV rows
	var stream = through2.obj(function (chunk, enc, callback) {
		var row = [];

		// Turn Mongo models into actual objects so JSONPath can work with them
		if (null != chunk.toObject) {
			chunk = chunk.toObject();
		}

		columns.forEach(function (column) {
			if (column.hasOwnProperty('key')) {
				// Get the value from the object using jsonpath
				var value = jsonpath.eval(chunk, '$.' + column.key);

				// Get the first returned value
				if (value.length > 0) {
					value = value[0];
				}
				else {
					value = null;
				}

				// Invoke any callback associated with the column
				if (column.hasOwnProperty('callback')) {
					value = column.callback(value);
				}

				// Emit a blank column rather than null
				if (null == value) {
					value = '';
				}
				row.push(value);
			}
		});

		// Emit the row to the output stream, piped to the CSV stringifier
		callback(null, row);
	});

	// Parse the columns array into a format the CSV stringify module is expecting
	var csvColumns = [];
	columns.forEach(function(value) {
		if (value.hasOwnProperty('title')) {
			csvColumns.push(value.title);
		}
	});

	// Assemble the CSV headers and stream the CSV response back to the client
	var csv = stringify({
		header: true,
		columns: csvColumns
	});

	// Create an output stream piping the parsing stream to the CSV stream
	var out = pipe(stream, csv);

	out.on('error', function(err) {
		logger.err(err, 'Failed to create CSV');
	});

	return out;
};
