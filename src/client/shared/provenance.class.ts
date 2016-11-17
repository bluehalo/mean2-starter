/**
 * Provenance is used to stamp various documents with originating information.  The username and org are meant to be
 * captured at the creation time.  This is not to be confused with simply logging a reference to a user.
 */
export class Provenance {
	constructor(
		public username: string = null,
		public org: string = null,
		public created: number = null,
		public updated: number = null
	) {}
}
