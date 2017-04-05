export class Alert {
	constructor(
		public id: number,
		public type: string,
		public msg: string) {}
}

export class Alerts {
	list: Alert[] = [];
	map: Map<number, Alert> = new Map<number, Alert>();
}
