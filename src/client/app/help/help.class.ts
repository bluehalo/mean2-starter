export class HelpTopic {
	public url: string;
	public templateUrl: string;

	constructor(
		public title: string,
		public id?: string,
		public module?: string
	) {}
}
