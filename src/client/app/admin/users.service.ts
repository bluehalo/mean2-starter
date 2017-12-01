import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { User } from './user.class';
import { AsyHttp, HttpOptions } from '../shared/asy-http.service';
import { IPagingResults, PagingOptions } from '../shared/pager.component';

@Injectable()
export class UserService {

	constructor(private asyHttp: AsyHttp) {}

	update(user: User): Observable<any> {
		return this.asyHttp.post(new HttpOptions('user/me', () => {}, user.userModel));
	}

	match(query: any, search: string, paging: PagingOptions): Observable<IPagingResults> {
		return this.asyHttp.post(new HttpOptions('users/match?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { s: search, q: query }));
	}
}
