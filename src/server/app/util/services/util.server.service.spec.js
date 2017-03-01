'use strict';

/**
 * Module dependencies.
 */
var
	should = require('should'),
	path = require('path').posix,
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

	describe('getPage:', () => {
		[{
			input: null,
			expected: 0,
			name: 'should handle null values with default 0'
		}, {
			input: 6,
			expected: 0,
			name: 'should handle number inputs with default 0'
		}, {
			input: 'test',
			expected: 0,
			name: 'should handle string inputs with default 0'
		}, {
			input: true,
			expected: 0,
			name: 'should handle boolean inputs with default 0'
		}, {
			input: { limit: 50 },
			expected: 0,
			name: 'should handle empty values with default 0'
		}, {
			input: { page: -5 },
			expected: 0,
			name: 'should return 0 for negative values'
		}, {
			input: { page: 1 },
			expected: 1,
			name: 'should return value for positive input'
		}, {
			input: { page: 'first' },
			expected: 0,
			name: 'should return default value 0 for string'
		}, {
			input: { page: 10000000 },
			expected: 10000000,
			name: 'should return large, positive input'
		}].forEach((test) => {
			it(test.name, () => {
				const actual = util.getPage(test.input);
				should(actual).equal(test.expected);
			});
		});
	});

	describe('getLimit:', () => {

		const defaultLimit = 20, defaultMax = 100;

		[{
			inputQueryParams: null,
			inputMaxSize: null,
			expected: defaultLimit,
			name: 'should handle null values with default'
		}, {
			inputQueryParams: {},
			inputMaxSize: null,
			expected: defaultLimit,
			name: 'should handle empty values with default'
		}, {
			inputQueryParams: { size: -5 },
			inputMaxSize: null,
			expected: 1,
			name: 'should return 1 for negative values'
		}, {
			inputQueryParams: { size: 0 },
			inputMaxSize: null,
			expected: 1,
			name: 'should return 1 for zero values'
		}, {
			inputQueryParams: { size: 5 },
			inputMaxSize: null,
			expected: 5,
			name: 'should return value for positive input'
		}, {
			inputQueryParams: { size: 'twenty' },
			inputMaxSize: null,
			expected: defaultLimit,
			name: 'should return default for string'
		}, {
			inputQueryParams: { size: 10000000 },
			inputMaxSize: null,
			expected: defaultMax,
			name: 'should cap limit to default max'
		}, {
			inputQueryParams: { size: 10000000 },
			inputMaxSize: 50,
			expected: 50,
			name: 'should cap limit to input max'
		}].forEach((test) => {
			it(test.name, () => {
				const actual = util.getLimit(test.inputQueryParams, test.inputMaxSize);
				should(actual).equal(test.expected);
			});
		});
	});

	describe('contains:', () => {
		[{
			inputArray: [1, 2, 3],
			inputElement: 2,
			expected: true,
			name: 'should return true for number in array'
		}, {
			inputArray: [{id:1}, {id:2}, {id:3}],
			inputElement: {id:2},
			expected: true,
			name: 'should return true for object with same values'
		}, {
			inputArray: [{id:1}, {id:2}, {id:3}],
			inputElement: {id:2, name:'Test'},
			expected: false,
			name: 'should return false for object with additional attributes'
		}, {
			inputArray: [false, false, false],
			inputElement: false,
			expected: true,
			name: 'should return true for boolean in array'
		}, {
			inputArray: [true, false],
			inputElement: true,
			expected: true,
			name: 'should return true for boolean in array'
		}, {
			inputArray: [true, true],
			inputElement: false,
			expected: false,
			name: 'should return false for boolean not in array'
		}, {
			inputArray: ['test', 'it', { id: 3 }],
			inputElement: 'it',
			expected: true,
			name: 'should return true for string in array'
		}, {
			inputArray: ['testing', 'it out', 45, false, { id: 5 }],
			inputElement: true,
			expected: false,
			name: 'should return false for boolean not in array'
		}].forEach((test) => {
			it(test.name, () => {
				const actual = util.contains(test.inputArray, test.inputElement);
				should(actual).equal(test.expected);
			});
		});
	});

});
