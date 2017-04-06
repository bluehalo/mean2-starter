import * as _ from 'lodash';

export class StringUtils {

	/**
	 * Returns true if input is a string and it is not empty.
	 */
	public static isNonEmptyString(s: any): boolean {
		return (_.isString(s) && s.trim().length > 0);
	}

	/**
	 * Returns true if input is not a string or if input is empty
	 *
	 * @param s
	 * @returns {boolean}
	 */
	public static isInvalid(s: any): boolean {
		return !StringUtils.isNonEmptyString(s);
	}

	public static camelToHuman(s: string) {
		if (null == s) {
			return null;
		}
		let result = s.replace( /([A-Z])/g, ' $1' );
		return result.charAt(0).toUpperCase() + result.slice(1);
	}

	/**
	 * Returns the string with every first letter of each word is upper case and the rest are lower case
	 *
	 * @param s
	 * @returns {string}
	 */
	public static toTitleCase(s: string) {
		if (null == s)
			return null;

		return s.replace(/\w\S*/g, (txt) => {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

}
