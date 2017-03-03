import { Resource } from '../resources/resource.class';

export class Notification {
	public _id: string;
	public resource: Resource;
	public seedId: string;
	public start: number;
	public end: number;

	public setFromModel(model: any): Notification {
		this._id = model._id;
		this.resource = model.resource;
		this.seedId = model.seedId;
		this.start = model.start;
		this.end = model.end;

		return this;
	}
}
