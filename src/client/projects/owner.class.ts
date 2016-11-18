export class Owner {
	constructor(
		public type: 'team' | 'user',
		public id: string,
		public name?: string
	) {}
}