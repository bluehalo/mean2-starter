import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { AsyHttp, HttpOptions } from '../../shared/asy-http.service';
import { IPagingResults, PagingOptions } from '../../shared/pager.component';
import { Tag } from './tags.class';

@Injectable()
export class TagsService {

	cache: any = {};

	constructor(private asyHttp: AsyHttp) {}

	searchTags(query: any, search: string, paging: PagingOptions, options: any): Observable<IPagingResults> {
		return this.asyHttp.post(new HttpOptions('tags?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { s: search, q: query, options: options }));
	}

	// Retrieve all tags (or up to 1000)
	selectionList(): Observable<IPagingResults> {
		return this.searchTags({}, null, new PagingOptions(0, 1000), {});
	}

	getTag(tagId: string): Observable<any> {
		return this.asyHttp.get(new HttpOptions('tag/' + tagId, () => {}));
	}

	createTag(tag: Tag): Observable<any> {
		return this.asyHttp.put(new HttpOptions('tag', () => {}, tag));
	}

	updateTag(tag: Tag): Observable<any> {
		return this.asyHttp.post(new HttpOptions('tag/' + tag._id, () => {}, tag));
	}

	deleteTag(tagId: string): Observable<any> {
		return this.asyHttp.delete(new HttpOptions('tag/' + tagId, () => {}));
	}
}
