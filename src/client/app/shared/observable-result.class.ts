export class ObservableResult {

	constructor(
		public state: 'success' | 'error',
		public value: any
	) {}

}
