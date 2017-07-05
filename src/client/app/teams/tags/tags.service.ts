import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { AsyHttp, HttpOptions, PagingOptions } from 'app/shared';

import { Tag } from './tags.class';

@Injectable()
export class TagsService {

	public cache: any = {};

	constructor(
		private asyHttp: AsyHttp
	) {
	}

	public searchTags(query: any, search: string, paging: PagingOptions, options: any): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('tags?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { s: search, q: query, options: options }));
	}

	// Retrieve all tags (or up to 1000)
	public selectionList(): Observable<Response> {
		return this.searchTags({}, null, new PagingOptions(0, 1000), {});
	}

	public getTag(tagId: string): Observable<Response> {
		return this.asyHttp.get(new HttpOptions('tag/' + tagId, () => {}));
	}

	public createTag(tag: Tag): Observable<Response> {
		return this.asyHttp.put(new HttpOptions('tag', () => {}, tag));
	}

	public updateTag(tag: Tag): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('tag/' + tag._id, () => {}, tag));
	}

	public deleteTag(tagId: string): Observable<Response> {
		return this.asyHttp.delete(new HttpOptions('tag/' + tagId, () => {}));
	}
}
