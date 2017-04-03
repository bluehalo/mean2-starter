import { Injectable } from '@angular/core';

import { AsyHttp, HttpOptions, PagingOptions } from 'app/shared';

import { User } from './user';

@Injectable()
export class UserService {
	constructor(
		private asyHttp: AsyHttp
	) {}

	public update (user: User) {
		return this.asyHttp.post(new HttpOptions('user/me', () => {}, user.userModel));
	};

	public match (query: any, search: string, paging: PagingOptions) {
		return this.asyHttp.post(new HttpOptions('users/match?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { s: search, q: query }));
	}
}
