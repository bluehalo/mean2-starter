import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Observable';

import { AsyHttp, HttpOptions } from '../shared/asy-http.service';
import { IPagingResults, PagingOptions } from '../shared/pager.component';

@Injectable()
export class AuditService {

	constructor(private asyHttp: AsyHttp) {}

	getDistinctAuditValues(field: string): Observable<any> {
		return this.asyHttp.get(new HttpOptions('audit/distinctValues?' + this.asyHttp.urlEncode({field: field}), () => {}));
	}

	search(query: any, search: string, paging: PagingOptions): Observable<IPagingResults> {
		return this.asyHttp.post(new HttpOptions('audit?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { s: search, q: query }))
			.map((result: IPagingResults) => {
				if (null != result && Array.isArray(result.elements)) {
					result.elements = result.elements.filter((e: any) => (null != e && null != e.audit && null != e.audit.object));
				}

				return result;
			});
	}
}
