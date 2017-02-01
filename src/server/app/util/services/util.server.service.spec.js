'use strict';

/**
 * Module dependencies.
 */
var
	should = require('should'),
	path = require('path'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	util = deps.utilService;

/**
 * Globals
 */


/**
 * Unit tests
 */
describe('Utils:', () => {

	describe('toMongoose:', () => {

		it('should convert $date : {""} to new Date("")', () => {
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
		});

		it('should convert $obj : {""} to mongoose.Types.ObjectId("")', () => {
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
		});

	});

	describe('Date Parse:', () => {

		[{
			input: '2017-01-01T12:34:56.789Z',
			expected: 1483274096789,
			name: 'should properly parse a date string'
		}, {
			input: '2017-01-01T12:34Z',
			expected: 1483274040000,
			name: 'should properly parse a date without seconds'
		}, {
			input: new Date('2017-01-01T12:34:56.789Z'),
			expected: 1483274096789,
			name: 'should properly parse a date object'
		}, {
			input: 1483274096789,
			expected: 1483274096789,
			name: 'should properly parse a number'
		}, {
			input: 1483274096,
			expected: 1483274096,
			name: 'should properly parse a number that is not actually a date'
		}, {
			input: null,
			expected: null,
			name: 'should handle null inputs'
		}].forEach((test) => {
			it(test.name, () => {
				const actual = util.dateParse(test.input);
				should(actual).equal(test.expected);
			});
		});

	});

});
