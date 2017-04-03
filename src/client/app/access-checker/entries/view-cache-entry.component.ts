import { Component } from '@angular/core';

import { DialogRef, ModalComponent } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap/index';

import { CacheEntry } from '../cache-entries.service';

export class ViewCacheEntryModalContext extends BSModalContext {
	cacheEntry: CacheEntry;

	constructor() {
		super();
		this.size = 'lg';
	}
}

@Component({
	templateUrl: 'view-cache-entry.component.html'
})
export class ViewCacheEntryModal implements ModalComponent<ViewCacheEntryModalContext> {
	context: ViewCacheEntryModalContext;

	constructor(
		public dialog: DialogRef<ViewCacheEntryModalContext>
	) {
		this.context = dialog.context;
	}

	/**
	 * Invoked before a modal is dismissed, return true to cancel dismissal.
	 */
	beforeDismiss(): boolean {
		return false;
	}
	/**
	 * Invoked before a modal is closed, return true to cancel closing.
	 */
	beforeClose(): boolean {
		return false;
	}

	done() {
		this.dialog.close();
	}
}
