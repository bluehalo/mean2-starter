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

});
