import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs';

import { AsyHttp, HttpOptions } from 'app/shared/asy-http.service';
import { PagingOptions } from 'app/shared/pager.component';
import { EndUserAgreement } from './eua.class';

@Injectable()
/**
 * Admin management of users
 */
export class EuaService {

	public cache: any = {};

	constructor(private asyHttp: AsyHttp) {}

	/**
	 * Public methods to be exposed through the service
	 */

	// Create
	create(eua: EndUserAgreement): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('eua', () => {}, eua.euaModel));
	}

	// Retrieve
	get(id: string): Observable<Response> {
		return this.asyHttp.get(new HttpOptions('eua/' + id, () => {}));
	}

	// Search Euas
	search(query: any, search: string , paging: PagingOptions, options: any): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('euas?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, {q: query, s: search, options: options}));
	}

	// Update
	update(eua: EndUserAgreement): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('eua/' + eua.euaModel._id, () => {}, eua.euaModel));
	}

	// Delete
	remove(id: string): Observable<Response> {
		return this.asyHttp.delete(new HttpOptions('eua/' + id, () => {}));
	}

	publish(id: string): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('eua/' + id + '/publish', () => {}));
	}

}
