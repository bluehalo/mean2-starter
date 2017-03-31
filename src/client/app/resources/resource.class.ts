
import { Tag } from 'app/teams/tags/tags.class';
import { Owner } from './owner.class';

export abstract class Resource {
	constructor(
		public _id?: string,
		public owner?: Owner,
		public title?: string,
		public description?: string,
		public created?: number,
		public updated?: number,
		public tags: Tag[] = []
	) {}
}
