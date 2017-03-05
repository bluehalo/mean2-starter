import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from './user.class';
import { AsyHttp, HttpOptions } from '../shared/asy-http.service';
import { PagingOptions } from '../shared/pager.component';

@Injectable()
export class UserService {
	constructor(
		private asyHttp: AsyHttp
	) {}

	public update (user: User): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('user/me', () => {}, user.userModel));
	};

	public match (query: any, search: string, paging: PagingOptions): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('users/match?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { s: search, q: query }));
	}
}
