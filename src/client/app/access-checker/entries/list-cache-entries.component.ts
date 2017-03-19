import { Component } from '@angular/core';
import { Response } from '@angular/http';

import { overlayConfigFactory } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap';

import { CacheEntriesService, CacheEntry } from '../cache-entries.service';
import { AlertService } from '../../shared/alert.service';
import { SortDirection, SortDisplayOption } from '../../shared/result-utils.class';
import { PagingOptions } from '../../shared/pager.component';
import { TableSortOptions } from '../../shared/pageable-table/pageable-table.component';
import { ViewCacheEntryModal, ViewCacheEntryModalContext } from './view-cache-entry.component';

@Component({
	selector: 'cache-entries',
	templateUrl: 'list-cache-entries.component.html'
})
export class ListCacheEntriesComponent {

	cacheEntries: any[] = [];
	search = '';
	pagingOpts: PagingOptions;
	entryToView: CacheEntry;
	viewCacheEntryVisible: boolean;

	sortOpts: TableSortOptions = {
		key: new SortDisplayOption('Key', 'key', SortDirection.asc),
		timestamp: new SortDisplayOption('Timestamp', 'ts', SortDirection.desc)
	};

	constructor(
		public cacheEntriesService: CacheEntriesService,
		public alertService: AlertService,
		private modal: Modal
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
	};

	confirmDeleteEntry(cacheEntry: any) {
		let entryToDelete = cacheEntry.entry;

		this.modal.confirm()
			.size('lg')
			.showClose(true)
			.isBlocking(true)
			.title('Delete cache entry?')
			.body(`Are you sure you want to delete entry: ${cacheEntry.entry.key}?`)
			.okBtn('Delete')
			.open()
			.then(
				(resultPromise: any) => resultPromise.result.then(
					// Success
					() => {
						this.cacheEntriesService.remove(entryToDelete.key).subscribe(
							() => {
								this.alertService.addAlert(`Deleted cache entry: ${entryToDelete.key}`, 'success');
								this.loadCacheEntries();
							},
							(response: Response) => {
								this.alertService.addAlert(response.json().message);
							});
					},
					// Fail
					() => {}
				)
			);
	};

	viewCacheEntry(cacheEntry: any) {
		this.modal.open(ViewCacheEntryModal, overlayConfigFactory({cacheEntry: cacheEntry}, ViewCacheEntryModalContext));
	}

	refreshCacheEntry(cacheEntry: any) {
		// temporary flag to show that the entry is refreshing
		cacheEntry.isRefreshing = true;

		let key = cacheEntry.entry.key;
		this.cacheEntriesService.refresh(key).subscribe(
			() => {
				this.alertService.addAlert(`Refreshed cache entry: ${key}`, 'success');
				cacheEntry.isRefreshing = false;
				this.applySearch();
			},
			(response: Response) => {
				this.alertService.addAlert(response.json().message);
				cacheEntry.isRefreshing = false;
			}
		);
	};


	private loadCacheEntries() {
		this.cacheEntriesService.match({}, this.search, this.pagingOpts).subscribe(
			(result: any) => {
				if (result && Array.isArray(result.elements)) {
					this.cacheEntries = result.elements.map((element: any) => {
						return {
							entry: new CacheEntry(element.key, element.value, element.ts),
							isRefreshing: false
						};
					});
					this.pagingOpts.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
				} else {
					this.pagingOpts.reset();
				}
			},
			(response: Response) => {
				this.alertService.addAlert(response.json().message);
			});
	}

}
