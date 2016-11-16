'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

exports.GetterSchema = function (add) {
	var schema = new Schema(add);

	schema.set('toObject', { getters: true });
	schema.set('toJSON', { getters: true });

	return schema;
};