import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { AsyHttp, HttpOptions } from '../../shared/asy-http.service';
import { AuthenticationService } from '../../admin/authentication.service';
import { User } from '../../admin/user.class';

export class Group {
	constructor (
		public _id: string,
		public title: string,
		public description?: string) {}
}

@Injectable()
export class GroupsService {
	constructor(
		private asyHttp: AsyHttp,
		private auth: AuthenticationService
	) {
	}

	public search(query: any, search: any, paging: any) {
		return this.asyHttp.post(new HttpOptions('groups?' + this.asyHttp.urlEncode(paging), () => {}, { s: search , q: query }));
	}

	public selectionListEditable(): Observable<Group[]> {
		let query = {};
		let user: User = this.auth.getCurrentUser();
		if (!user.isAdmin()) {
			query = { _id: { $in: user.editableGroups() } };
		}

		return this.search(query, undefined, { sort: 'title', runCount: false })
			.map((result: any) => { return result.elements.map((raw: any) => new Group(raw._id, raw.title, raw.description)); });
	}

	public selectionListViewable(): Observable<Group[]> {
		let query = {};
		let user: User = this.auth.getCurrentUser();
		if (!user.isAdmin()) {
			query = { _id: { $in: Object.keys(user.groups) } };
		}

		return this.search(query, undefined, { sort: 'title', runCount: false })
			.map((result: any) => { return result.elements.map((raw: any) => new Group(raw._id, raw.title, raw.description)); });
	}



}

