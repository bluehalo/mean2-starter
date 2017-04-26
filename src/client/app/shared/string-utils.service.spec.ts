import { StringUtils } from './string-utils.service';

describe('StringUtils', () => {

	describe('isNonEmptyString', () => {
		it('returns true if input is non-empty string', () => {
			expect(StringUtils.isNonEmptyString('test-string')).toBe(true);
		});

		it('returns false if input is empty string', () => {
			expect(StringUtils.isNonEmptyString('')).toBe(false);
		});

		it ('returns false if input is not a string', () => {
			expect(StringUtils.isNonEmptyString({})).toBe(false);
		});
	});

	describe('isInvalid', () => {
		it('returns false if input is non-empty string', () => {
			expect(StringUtils.isInvalid('test-string')).toBe(false);
		});

		it('returns true if input is empty string', () => {
			expect(StringUtils.isInvalid('')).toBe(true);
		});

		it ('returns true if input is not a string', () => {
			expect(StringUtils.isInvalid({})).toBe(true);
		});
	});

	describe('toTitleCase', () => {
		it('returns null if input undefined', () => {
			expect(StringUtils.toTitleCase(undefined)).toBe(null);
		});

		it('returns null if input null', () => {
			expect(StringUtils.toTitleCase(null)).toBe(null);
		});

		it('returns empty string if input is empty', () => {
			expect(StringUtils.toTitleCase('')).toBe('');
		});

		it('returns Capitalized single word if lower case', () => {
			expect(StringUtils.toTitleCase('test')).toBe('Test');
		});

		it('returns Capitalized single word if upper case', () => {
			expect(StringUtils.toTitleCase('TEST')).toBe('Test');
		});

		it('returns Capitalized 2 words', () => {
			expect(StringUtils.toTitleCase('test string')).toBe('Test String');
		});

		it('returns Capitalized on hyphenated word', () => {
			expect(StringUtils.toTitleCase('test-string')).toBe('Test-string');
		});
	});

});
