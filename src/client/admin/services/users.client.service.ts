import { Injectable } from '@angular/core';

import { User } from '../model/user.client.class';
import { AsyHttp, HttpOptions } from '../../shared/services/asy-http.client.service';
import { PagingOptions } from '../../shared/components/pager.client.component';

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
