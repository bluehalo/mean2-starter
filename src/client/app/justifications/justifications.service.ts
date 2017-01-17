import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { AsyHttp, HttpOptions } from '../shared/asy-http.service';
import { PagingOptions } from '../shared/pager.component';

@Injectable()
export class JustificationsService {

	constructor(
		private asyHttp: AsyHttp
	) {}

	public searchJustifications(query: any, search: string, paging: PagingOptions, options: any) {
		return this.asyHttp.post(new HttpOptions(`justifications?${this.asyHttp.urlEncode(paging.toObj())}`, () => {}, {s: search, q: query, options: options }));
	}
}
