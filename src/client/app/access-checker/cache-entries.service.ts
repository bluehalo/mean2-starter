import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { AsyHttp, HttpOptions } from '../shared/asy-http.service';
import { PagingOptions, IPagingResults, NULL_PAGING_RESULTS } from '../shared/pager.component';
import { AlertService } from '../shared/alert.service';

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
		private asyHttp: AsyHttp,
		private alertService: AlertService
	) {}

	match(query: any, search: string, paging: PagingOptions): Observable<IPagingResults> {
		return this.asyHttp.post(new HttpOptions('access-checker/entries/match?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { s: search, q: query }))
			.map((result: IPagingResults) => {
				if (null != result && Array.isArray(result.elements)) {
					result.elements = result.elements.map((element: any) => ( { entry: new CacheEntry(element.key, element.value, element.ts), isRefreshing: false } ));
				}

				return result;
			})
			.catch((error: HttpErrorResponse) => {
				this.alertService.addAlert(error.error.message);
				return Observable.of(NULL_PAGING_RESULTS);
			});
	}

	remove(key: string): Observable<boolean> {
		return this.asyHttp.delete(new HttpOptions('access-checker/entry/' + encodeURIComponent(key), () => {}, { key: key }))
			.map(() => {
				this.alertService.addAlert(`Deleted cache entry: ${key}`, 'success');
				return true;
			})
			.catch((error: HttpErrorResponse) => {
				this.alertService.addAlert(error.error.message);
				return Observable.of(false);
			});
	}

	refresh(key: string): Observable<boolean> {
		return this.asyHttp.post(new HttpOptions('access-checker/entry/' + encodeURIComponent(key), () => {}, { key: key }))
			.map(() => {
				this.alertService.addAlert(`Refreshed cache entry: ${key}`, 'success');
				return true;
			})
			.catch((error: HttpErrorResponse) => {
				this.alertService.addAlert(error.error.message);
				return Observable.of(false);
			});
	}

	refreshCurrentUser(): Observable<any> {
		return this.asyHttp.post(new HttpOptions('access-checker/user', () => {}));
	}
}
