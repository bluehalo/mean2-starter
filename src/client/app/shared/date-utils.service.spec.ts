import { DateUtilsService } from './date-utils.service';

describe('DateUtilsService', () => {

	describe('dateParse', () => {
		it('returns null if null', () => {
			expect(DateUtilsService.dateParse(null)).toBeNull();
		});

		it('returns null if undefined', () => {
			expect(DateUtilsService.dateParse(undefined)).toBeNull();
		});

		it('returns null if object', () => {
			expect(DateUtilsService.dateParse({})).toBeNull();
		});

		it('returns null if array', () => {
			expect(DateUtilsService.dateParse([])).toBeNull();
		});

		it('returns null if function', () => {
			expect(DateUtilsService.dateParse(() => {})).toBeNull();
		});

		it('returns number if number', () => {
			expect(DateUtilsService.dateParse(0)).toBe(0);
			expect(DateUtilsService.dateParse(12345)).toBe(12345);
			expect(DateUtilsService.dateParse(-12345)).toBe(-12345);
		});

		it('returns number if string is a number', () => {
			expect(DateUtilsService.dateParse('0')).toBe(0);
			expect(DateUtilsService.dateParse('12345')).toBe(12345);
			expect(DateUtilsService.dateParse('-12345')).toBe(-12345);
		});

		it('returns null if string is bad', () => {
			expect(DateUtilsService.dateParse('2017-0000000000000')).toBeNull();
			expect(DateUtilsService.dateParse('Hello')).toBeNull();
		});

		it('returns number if string is a date', () => {
			expect(DateUtilsService.dateParse('1970-01-01')).toBe(0);
			expect(DateUtilsService.dateParse('1970-01-01T00:00:00.000Z')).toBe(0);
			expect(DateUtilsService.dateParse('2017-06-19T20:41:45.000Z')).toBe(1497904905000);
		});

		it('returns number if date', () => {
			expect(DateUtilsService.dateParse(new Date(0))).toBe(0);
			expect(DateUtilsService.dateParse(new Date(12345))).toBe(12345);
			const now = new Date();
			expect(DateUtilsService.dateParse(now)).toBe(now.getTime());
		});
	});

});
