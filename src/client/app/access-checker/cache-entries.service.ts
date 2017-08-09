import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { AsyHttp, HttpOptions } from '../shared/asy-http.service';
import { PagingOptions } from '../shared/pager.component';

export class CacheEntry {
	date: Date;

	constructor(
		public key: string,
		public value: any,
		public ts: number
	) {
		this.date = new Date(ts);
	}
}

@Injectable()
export class CacheEntriesService {
	constructor(
		private asyHttp: AsyHttp
	) {}

	public match(query: any, search: string, paging: PagingOptions): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('access-checker/entries/match?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { s: search, q: query }));
	}

	public remove(key: string): Observable<Response> {
		return this.asyHttp.delete(new HttpOptions('access-checker/entry/' + encodeURIComponent(key), () => {}, { key: key }));
	}

	public refresh(key: string): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('access-checker/entry/' + encodeURIComponent(key), () => {}, { key: key }));
	}

	public refreshCurrentUser(): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('access-checker/user', () => {}));
	}

}
