import { Component } from '@angular/core';

import { BsModalRef, BsModalService } from 'ngx-bootstrap';

import { CacheEntriesService } from './cache-entries.service';
import { AlertService } from '../shared/alert.service';
import { SortDirection, SortDisplayOption } from '../shared/result-utils.class';
import { PagingOptions, IPagingResults } from '../shared/pager.component';
import { TableSortOptions } from '../shared/pageable-table/pageable-table.component';
import { ModalAction, ModalService } from '../shared/asy-modal.service';
import { ViewCacheEntryModal } from './view-cache-entry.component';

@Component({
	selector: 'cache-entries',
	templateUrl: 'admin-cache-entries.component.html'
})
export class AdminCacheEntriesComponent {

	cacheEntries: any[] = [];

	search: string = '';

	pagingOpts: PagingOptions;

	sortOpts: TableSortOptions = {
		key: new SortDisplayOption('Key', 'key', SortDirection.asc),
		timestamp: new SortDisplayOption('Timestamp', 'ts', SortDirection.desc)
	};

	private cacheEntryModalRef: BsModalRef;

	constructor(
		private modalService: BsModalService,
		private asyModalService: ModalService,
		private cacheEntriesService: CacheEntriesService,
		public alertService: AlertService
	) {}

	ngOnInit() {
		this.alertService.clearAllAlerts();

		this.pagingOpts = new PagingOptions();
		this.pagingOpts.sortField = this.sortOpts['key'].sortField;
		this.pagingOpts.sortDir = this.sortOpts['key'].sortDir;

		this.loadCacheEntries();
	}

	applySearch() {
		this.pagingOpts.setPageNumber(0);
		this.loadCacheEntries();
	}

	goToPage(event: any) {
		this.pagingOpts.update(event.pageNumber, event.pageSize);
		this.loadCacheEntries();
	}

	setSort(sortOpt: SortDisplayOption) {
		this.pagingOpts.sortField = sortOpt.sortField;
		this.pagingOpts.sortDir = sortOpt.sortDir;
		this.loadCacheEntries();
	}

	confirmDeleteEntry(cacheEntry: any) {
		const entryToDelete = cacheEntry.entry;

		this.asyModalService
			.confirm('Delete cache entry?', `Are you sure you want to delete entry: ${cacheEntry.entry.key}?`, 'Delete')
			.first()
			.filter((action: ModalAction) => action === ModalAction.OK)
			.switchMap(() => this.cacheEntriesService.remove(entryToDelete.key))
			.filter((success: boolean) => success)
			.subscribe(() => this.loadCacheEntries());
	}

	viewCacheEntry(cacheEntry: any) {
		this.cacheEntryModalRef = this.modalService.show(ViewCacheEntryModal, { ignoreBackdropClick: true, class: 'modal-lg' });
		this.cacheEntryModalRef.content.cacheEntry = cacheEntry.entry;
	}

	refreshCacheEntry(cacheEntry: any) {
		cacheEntry.isRefreshing = true;

		const key = cacheEntry.entry.key;
		this.cacheEntriesService.refresh(key)
			.do(() => cacheEntry.isRefreshing = false)
			.filter((success: boolean) => success)
			.subscribe((success: boolean) => this.applySearch());
	}

	private loadCacheEntries() {
		this.cacheEntriesService.match({}, this.search, this.pagingOpts).subscribe((result: IPagingResults) => {
			this.cacheEntries = result.elements;
			if (this.cacheEntries.length > 0) {
				this.pagingOpts.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
			}
			else {
				this.pagingOpts.reset();
			}
		});
	}
}
