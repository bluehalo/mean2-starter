import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { AsyHttp, HttpOptions } from '../../shared/asy-http.service';
import { IPagingResults, NULL_PAGING_RESULTS, PagingOptions } from '../../shared/pager.component';
import { EndUserAgreement } from './eua.class';

@Injectable()
/**
 * Admin management of users
 */
export class EuaService {

	cache: any = {};

	constructor(private asyHttp: AsyHttp) {}

	/**
	 * Public methods to be exposed through the service
	 */

	// Create
	create(eua: EndUserAgreement): Observable<any> {
		return this.asyHttp.post(new HttpOptions('eua', () => {}, eua.euaModel));
	}

	// Retrieve
	get(id: string): Observable<EndUserAgreement> {
		return this.asyHttp.get(new HttpOptions('eua/' + id, () => {}))
			.map((result: any) => new EndUserAgreement().setFromEuaModel(result));
	}

	// Search Euas
	search(query: any, search: string , paging: PagingOptions, options: any): Observable<IPagingResults> {
		return this.asyHttp.post(new HttpOptions('euas?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, {q: query, s: search, options: options}))
			.map((result: IPagingResults) => {
				if (null != result && Array.isArray(result.elements)) {
					result.elements = result.elements.map((element: any) => new EndUserAgreement().setFromEuaModel(element));
				}

				return result;
			})
			.catch(() => Observable.of(NULL_PAGING_RESULTS));
	}

	// Update
	update(eua: EndUserAgreement): Observable<any> {
		return this.asyHttp.post(new HttpOptions('eua/' + eua.euaModel._id, () => {}, eua.euaModel));
	}

	// Delete
	remove(id: string): Observable<any> {
		return this.asyHttp.delete(new HttpOptions('eua/' + id, () => {}));
	}

	publish(id: string): Observable<any> {
		return this.asyHttp.post(new HttpOptions('eua/' + id + '/publish', () => {}));
	}
}
