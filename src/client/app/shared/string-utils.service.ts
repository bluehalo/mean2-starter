export class StringUtils {

	public static camelToHuman(s: string) {
		if (null == s) {
			return null;
		}
		let result = s.replace( /([A-Z])/g, ' $1' );
		return result.charAt(0).toUpperCase() + result.slice(1);
	}

}
