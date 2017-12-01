import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { User } from './user.class';
import { AsyHttp, HttpOptions } from '../shared/asy-http.service';
import { IPagingResults, PagingOptions } from '../shared/pager.component';
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

	search(query: any, search: string, paging: PagingOptions, options: any): Observable<IPagingResults> {
		return this.asyHttp.post(new HttpOptions(`admin/users?${this.asyHttp.urlEncode(paging.toObj())}`, () => {}, { q: query, s: search, options: options }))
			.map((result: IPagingResults) => {
				if (null != result && Array.isArray(result.elements)) {
					result.elements = result.elements.map((element: any) => new User().setFromUserModel(element));
					this.teamsService.resolveTeamNames(result.elements);
				}

				return result;
		});
	}

	removeUser(id: string): Observable<any> {
		return this.asyHttp.delete(new HttpOptions(`admin/user/${id}`, () => {}));
	}

	getAll(query: any, field: string): Observable<any> {
		return this.asyHttp.post(new HttpOptions('admin/users/getAll', () => {}, { query: query, field: field }));
	}

	create(user: User): Observable<any> {
		return this.asyHttp.post(new HttpOptions('admin/user', () => {}, user.userModel));
	}

	get(userId: string): Observable<User> {
		return this.asyHttp.get(new HttpOptions(`admin/user/${userId}`, () => {}))
			.map((result: any) => new User().setFromUserModel(result));
	}

	update(user: User): Observable<any> {
		return this.asyHttp.post(new HttpOptions(`admin/user/${user.userModel._id}`, () => {}, user.userModel));
	}

}
