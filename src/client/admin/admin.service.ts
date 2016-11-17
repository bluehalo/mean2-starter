import { Injectable } from '@angular/core';

import { User } from './user.class';
import { AsyHttp, HttpOptions } from '../shared/asy-http.service';
import { PagingOptions } from '../shared/pager.component';

@Injectable()
/**
 * Admin management of users
 */
export class AdminService {

	public cache: any = {};

	constructor(
		private asyHttp: AsyHttp
	) {}

	search(query: any, search: string, paging: PagingOptions, options: any) {
		return this.asyHttp.post(new HttpOptions('admin/users?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { q: query, s: search, options: options }));
	};

	removeUser(id: string) {
		return this.asyHttp.delete(new HttpOptions('admin/user/' + id, () => {}));
	};

	getAll(query: any, field: string) {
		return this.asyHttp.post(new HttpOptions('admin/users/getAll', () => {}, { query: query, field: field }));
	};

	create (user: User) {
		return this.asyHttp.post(new HttpOptions('admin/user', () => {}, user.userModel));
	};

	get(userId: string) {
		return this.asyHttp.get(new HttpOptions('admin/user/' + userId, () => {}));
	};

	update(user: User) {
		return this.asyHttp.post(new HttpOptions('admin/user/' + user.userModel._id, () => {}, user.userModel));
	};

}
