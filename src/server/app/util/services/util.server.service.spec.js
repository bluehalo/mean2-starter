'use strict';

/**
 * Module dependencies.
 */
var
	path = require('path'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService;

/**
 * Globals
 */


/**
 * Unit tests
 */
describe('Utils:', function() {

	describe('toMongoose:', function() {

		it('should convert $date : {""} to new Date("")', function(done) {
			var input = {hello: {there: 'you are', when: [{},{something:0},{$date:'2015-01-01T00:00:00.000Z'}]}, date: {$date:'2015-07-01T00:00:00.000Z'}};

			var output = util.toMongoose(input);
			(typeof output.hello).should.equal('object');
			output.hello.there.should.equal('you are');
			Array.isArray(output.hello.when).should.equal(true);
			output.hello.when.length.should.equal(3);
			(typeof output.hello.when[0]).should.equal('object');
			(output.hello.when[0].length == null).should.equal(true);
			output.hello.when[1].something.should.equal(0);
			output.hello.when[2].getTime().should.equal(1420070400000);
			output.date.getTime().should.equal(1435708800000);
			done();
		});

		it('should convert $obj : {""} to mongoose.Types.ObjectId("")', function(done) {
			var input = {hello: {there: 'you are', when: [{},{something:0},{$obj:'000000000000000000000000'}]}, obj: {$obj:'000000000000000000000001'}};

			var output = util.toMongoose(input);
			(typeof output.hello).should.equal('object');
			output.hello.there.should.equal('you are');
			Array.isArray(output.hello.when).should.equal(true);
			output.hello.when.length.should.equal(3);
			(typeof output.hello.when[0]).should.equal('object');
			(output.hello.when[0].length == null).should.equal(true);
			output.hello.when[1].something.should.equal(0);
			output.hello.when[2]._bsontype.should.equal('ObjectID');
			output.hello.when[2].toHexString().should.equal('000000000000000000000000');
			output.obj._bsontype.should.equal('ObjectID');
			output.obj.toHexString().should.equal('000000000000000000000001');
			done();
		});

	});

});
