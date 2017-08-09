import * as _ from 'lodash';
import * as moment from 'moment';
import { Moment } from 'moment';

export class UtcDateUtils {

	private static defaultFormat: string = 'YYYY-MM-DD HH:mm:ss[Z]';

	static toTimestamp(value: string | number): number {
		if (null != value) {
			// If it's a number, assume it's a timestamp
			if (_.isNumber(value)) {
				return value;
			}
			// If it's a date, return the ts
			else if (_.isDate(value)) {
				return value.getTime();
			}
			// Now, it's either a date string or a number string
			else {
				let d = new Date(value);
				if (_.isNaN(d.getTime())) {
					return +value;
				}
				else {
					return d.getTime();
				}
			}
		}

		return null;
	}

	static format(value: string | number | Moment, format?: string): string {
		if (null != value) {
			let momentDate;
			if (moment.isMoment(value)) {
				momentDate = value;
			}
			else {
				const timestamp = UtcDateUtils.toTimestamp(value);
				momentDate = moment(timestamp).utc();
			}

			if (momentDate.isValid()) {
				return momentDate.format((null != format) ? format : UtcDateUtils.defaultFormat);
			}
		}

		return '-';
	}
}
