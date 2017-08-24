import { Component } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap';

import { CacheEntry } from './cache-entries.service';

@Component({
	templateUrl: 'view-cache-entry.component.html'
})
export class ViewCacheEntryModal {

	cacheEntry: CacheEntry;

	constructor(
		public modalRef: BsModalRef
	) {}
}
