import * as _ from 'lodash';

export class DateUtilsService {

	public static dateParse(date: any): number {
		// Handle nil values, arrays, and functions by simply returning null
		if (_.isNil(date) || _.isArray(date) || _.isFunction(date)) {
			return null;
		}

		// Date object should return its time in milliseconds
		if (_.isDate(date)) {
			return date.getTime();
		}

		// A number that exists will be interpreted as millisecond
		if (_.isFinite(date)) {
			return date;
		}

		// Handle number string
		if (!isNaN(date)) {
			return +date;
		}

		// Handle String, Object, etc.
		const parsed = Date.parse(date);

		// A string that cannot be parsed returns NaN
		if (isNaN(parsed)) {
			return null;
		}

		return parsed;
	}

}
