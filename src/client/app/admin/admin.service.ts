import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { Observable } from 'rxjs';

import { User } from './user.class';
import { AsyHttp, HttpOptions } from '../shared/asy-http.service';
import { PagingOptions } from '../shared/pager.component';
import { TeamsService } from '../teams/teams.service';

@Injectable()
/**
 * Admin management of users
 */
export class AdminService {

	cache: any = {};

	constructor(
		private asyHttp: AsyHttp,
		private teamsService: TeamsService
	) {}

	search(query: any, search: string, paging: PagingOptions, options: any): Observable<any> {
		return Observable.create((observer: any) => {
			this.asyHttp.post(new HttpOptions(`admin/users?${this.asyHttp.urlEncode(paging.toObj())}`, () => {}, { q: query, s: search, options: options }))
				.subscribe(
					(results: any) => {
						if (null != results && _.isArray(results.elements)) {
							results.elements = results.elements.map((element: any) => new User().setFromUserModel(element));
							this.teamsService.resolveTeamNames(results.elements);
						}
						observer.next(results);
					},
					(err: any) => {
						observer.error(err);
					},
					() => {
						observer.complete();
					});
		});
	}

	removeUser(id: string) {
		return this.asyHttp.delete(new HttpOptions(`admin/user/${id}`, () => {}));
	}

	getAll(query: any, field: string) {
		return this.asyHttp.post(new HttpOptions('admin/users/getAll', () => {}, { query: query, field: field }));
	}

	create(user: User) {
		return this.asyHttp.post(new HttpOptions('admin/user', () => {}, user.userModel));
	}

	get(userId: string) {
		return this.asyHttp.get(new HttpOptions(`admin/user/${userId}`, () => {}));
	}

	update(user: User) {
		return this.asyHttp.post(new HttpOptions(`admin/user/${user.userModel._id}`, () => {}, user.userModel));
	}

}
