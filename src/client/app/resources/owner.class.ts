export class Owner {
	constructor(
		public type: 'team' | 'user',
		public _id: string,
		public name?: string
	) {}
}
