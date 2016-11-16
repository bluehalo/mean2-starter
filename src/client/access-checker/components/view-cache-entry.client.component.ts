import { Component } from '@angular/core';

import { DialogRef, ModalComponent } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap/index';

import { CacheEntry } from '../services/cache-entries.client.service';

export class ViewCacheEntryModalContext extends BSModalContext {
	public cacheEntry: CacheEntry;

	constructor() {
		super();
		this.size = 'lg';
	}
}

@Component({
	templateUrl: '../views/view-cache-entry.client.view.html'
})
export class ViewCacheEntryModal implements ModalComponent<ViewCacheEntryModalContext> {
	private context: ViewCacheEntryModalContext;

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

	private done() {
		this.dialog.close();
	}
}
