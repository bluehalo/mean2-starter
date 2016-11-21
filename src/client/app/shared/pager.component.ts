import { Component, Input, Output, SimpleChange, EventEmitter } from '@angular/core';
import { SortDirection } from './result-utils.class';

export class PagingOptions {
	constructor(
		private pageNumber: number = 0,
		private pageSize: number = 50,
		private totalPages: number = 0,
		private totalSize: number = 0,
		public sortField?: string,
		public sortDir?: SortDirection
	) {}

	reset() {
		this.pageNumber = 0;
		this.pageSize = 50;
		this.totalPages = 0;
		this.totalSize = 0;
	}

	set(pageNumber: number, pageSize: number, totalPages: number, totalSize: number) {
		this.pageNumber = pageNumber;
		this.pageSize = pageSize;
		this.totalPages = totalPages;
		this.totalSize = totalSize;
	}

	update(pageNumber: number, pageSize: number) {
		this.pageNumber = pageNumber;
		this.pageSize = pageSize;
	}

	setPageNumber(pageNumber: number) {
		this.pageNumber = pageNumber;
	}

	public toObj(): any {
		return {
			page: this.pageNumber,
			size: this.pageSize,
			sort: this.sortField || null,
			dir: this.sortDir || null
		};
	}
}

@Component({
	selector: 'asy-pager',
	templateUrl: './pager.component.html'
})
export class Pager {

	@Input() pageNumber: number = 0;
	@Input() pageSize: number = 0;
	@Input() totalSize: number = 0;
	@Input() maxPageSize: number = 100;
	@Input() currentSize: number = 0;
	@Input() disableGoToEnd: boolean = false;
	@Input() showSortingControls: boolean = false;
	@Input() showCountWarning: boolean = false;
	@Input() countWarningMessage: string = '';

	@Output() onChange: EventEmitter<any> = new EventEmitter();

	private sortdir: SortDirection = SortDirection.desc;

	private totalPages: number = 0;

	private startFormatted: string = '';

	private endFormatted: string = '';

	private totalFormatted: string = 'unknown';

	constructor() {}

	ngOnInit() {
		// Constrain the max page size
		this.maxPageSize = Math.min(100, Math.max(this.maxPageSize, 1));

		this.calculateTotalPages();
		this.format();
	}

	ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
		if (changes.hasOwnProperty('pageSize') || changes.hasOwnProperty('totalSize')) {
			this.calculateTotalPages();
			this.format();
		}
	}

	private format() {
		this.startFormatted = ((this.pageSize * this.pageNumber) + 1).toLocaleString();

		let end = (this.pageSize * this.pageNumber) + this.maxPageSize;
		end = (end > this.totalSize) ? this.totalSize : end;
		this.endFormatted = end.toLocaleString();

		if (this.totalSize !== 0) {
			this.totalFormatted = this.totalSize.toLocaleString();
		}
	}

	private calculateTotalPages() {
		// Constrain the page size to the max
		this.pageSize = Math.min(this.maxPageSize, Math.max(this.pageSize, 1));

		// Calculate number of pages based on page size and number of results
		this.totalPages = Math.ceil(this.totalSize / this.pageSize);
	}

	private goToPage(pageNumber: number) {
		// Go to specific page number
		this.pageNumber = Math.min(this.totalPages - 1, Math.max(pageNumber, 0));
		this.format();

		// Emit change event
		this.onChange.emit({pageNumber: this.pageNumber, pageSize: this.pageSize, sortdir: this.sortdir});
	}

	private setPageSize(pageSize: number) {
		// Page size can never exceed the max
		this.pageSize = Math.min(this.maxPageSize, Math.max(pageSize, 0));

		// Since the size changed, go back to the first page
		this.pageNumber = 0;

		// Emit change event
		this.onChange.emit({pageNumber: this.pageNumber, pageSize: this.pageSize, sortdir: this.sortdir});
	}

	private sort(direction: SortDirection) {
		this.sortdir = direction;

		// Emit change event
		this.onChange.emit({pageNumber: this.pageNumber, pageSize: this.pageSize, sortdir: this.sortdir});
	}
}
