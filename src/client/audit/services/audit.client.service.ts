import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import { AsyHttp, HttpOptions } from '../../shared/asy-http.service';
import { PagingOptions } from '../../shared/pager.component';

@Injectable()
export class AuditService {
	constructor(
		private asyHttp: AsyHttp
	) {}

	public getDistinctAuditValues(field: string): Observable<Response> {
		return this.asyHttp.get(new HttpOptions('audit/distinctValues?' + this.asyHttp.urlEncode({field: field}), () => {}));
	}

	public search(query: any, search: string, paging: PagingOptions): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('audit?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { s: search, q: query }));
	}
}
