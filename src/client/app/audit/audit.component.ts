import { Component } from '@angular/core';

import { Modal } from 'angular2-modal/plugins/bootstrap';
import { overlayConfigFactory } from 'angular2-modal';
import { Observable } from 'rxjs/Observable';

import * as _ from 'lodash';
import * as moment from 'moment';

import { UserService } from 'app/admin/user';
import {
	PagingOptions, TableSortOptions,
	SortDisplayOption, SortDirection
} from 'app/shared';

import { AuditService } from './audit.service';
import { AuditViewDetailModalContext, AuditViewChangeModal, AuditViewDetailModal } from './audit-view-change.component';
import { AuditOption } from './audit.classes';


@Component({
	selector: 'audit',
	templateUrl: './audit-list.component.html'
})
export class AuditComponent {

	// List of audit entries
	auditEntries: any[] = [];
	auditEntriesLoaded: boolean = false;

	actionOptions: AuditOption[] = [];
	auditTypeOptions: AuditOption[] = [];

	queryUserSearchTerm: string = '';
	queryUserObj: any;

	// Search phrase
	search: string = '';
	pagingOpts: PagingOptions;
	userPagingOpts: PagingOptions;

	sortOpts: TableSortOptions = {
		created: new SortDisplayOption('Created', 'created', SortDirection.desc),
		actor: new SortDisplayOption('Actor', 'audit.actor.name', SortDirection.asc),
		type: new SortDisplayOption('Type', 'audit.auditType', SortDirection.desc)
	};

	dateRangeOptions: any[];
	dateRangeFilter: any;

	// Date picker
	showGteDatepicker: boolean = false;
	showLteDatepicker: boolean = false;

	queryStartDate: Date = moment.utc().subtract(1, 'days').toDate();
	queryEndDate: Date = moment.utc().toDate();
	searchUsersRef: Observable<any>;

	constructor(
		private auditService: AuditService,
		private userService: UserService,
		private modal: Modal
	) {}

	ngOnInit() {
		this.dateRangeOptions = [
			{ value: -1, display: 'Last 24 Hours' },
			{ value: -3, display: 'Last 3 Days' },
			{ value: -7, display: 'Last 7 Days' },
			{ value: 'everything', display: 'Everything' },
			{ value: 'choose', display: 'Select Date Range' }
		];

		this.pagingOpts = new PagingOptions();
		this.pagingOpts.sortField = this.sortOpts['created'].sortField;
		this.pagingOpts.sortDir = this.sortOpts['created'].sortDir;

		this.userPagingOpts = new PagingOptions(0, 20);
		this.userPagingOpts.sortField = 'username';
		this.userPagingOpts.sortDir = SortDirection.asc;

		// Default date range to last day
		this.dateRangeFilter = {
			selected: this.dateRangeOptions[0].value
		};

		// Bind the search users typeahead to a function
		this.searchUsersRef = Observable.create((observer: any) => {
			this.userService.match({}, this.queryUserSearchTerm, this.userPagingOpts)
				.subscribe((result: any) => {
					let formatted = result.elements
						.map((r: any) => {
							r.displayName = r.name + ' [' + r.username + ']';
							return r;
						});
					observer.next(formatted);
				});
		});

		// Load action and audit type options from the server
		Observable.forkJoin([this.auditService.getDistinctAuditValues('audit.action'), this.auditService.getDistinctAuditValues('audit.auditType')])
			.subscribe((results: any[]) => {
				this.actionOptions = results[0].filter((r: any) => _.isString(r)).sort().map((r: any) => new AuditOption(r));
				this.auditTypeOptions = results[1].filter((r: any) => _.isString(r)).sort().map((r: any) => new AuditOption(r));
			});

		this.loadAuditEntries();
	}

	goToPage(event: any) {
		this.pagingOpts.update(event.pageNumber, event.pageSize);
		this.loadAuditEntries();
	}

	setSort(name: string) {
		if (name === this.pagingOpts.sortField) {
			// Same column, reverse direction
			this.pagingOpts.sortDir = (this.pagingOpts.sortDir === SortDirection.asc) ? SortDirection.desc : SortDirection.asc;
		}
		else {
			// New column selected, default to ascending sort
			this.pagingOpts.sortField = name;
			this.pagingOpts.sortDir = SortDirection.asc;
		}
		this.loadAuditEntries();
	}

	updateDateRange() {
		this.showGteDatepicker = false;
		this.showLteDatepicker = false;
		this.loadAuditEntries();
	}

	typeaheadOnSelect(e: any) {
		this.queryUserObj = e;
		this.refresh();
	}

	viewMore(auditEntry: any, type: string) {
		switch (type) {
			case 'viewDetails':
				this.modal.open(AuditViewDetailModal, overlayConfigFactory({auditEntry: auditEntry}, AuditViewDetailModalContext));
				break;
			case 'viewChanges':
				this.modal.open(AuditViewChangeModal, overlayConfigFactory({auditEntry: auditEntry}, AuditViewDetailModalContext));
				break;
			default:
				break;
		}
	}

	refresh() {
		this.pagingOpts.reset();

		// If actor search bar is empty, clear the actor object, otherwise retain it
		if (null == this.queryUserSearchTerm || this.queryUserSearchTerm.length === 0) {
			this.queryUserObj = null;
		}

		this.loadAuditEntries();
	}

	private getTimeFilterQueryObject(): any {
		let timeQuery: any = null;

		if (this.dateRangeFilter.selected === 'choose') {
			if (null != this.queryStartDate) {
				timeQuery = (null == timeQuery) ? {} : timeQuery;
				timeQuery.$gte = moment.utc(this.queryStartDate).startOf('day');
			}
			if (null != this.queryEndDate) {
				timeQuery = (null == timeQuery) ? {} : timeQuery;
				timeQuery.$lt = moment.utc(this.queryEndDate).endOf('day');
			}
		}
		else if (this.dateRangeFilter.selected !== 'everything') {
			timeQuery = {
				$gte: moment.utc().add(this.dateRangeFilter.selected, 'days'),
				$lt: moment.utc()
			};
		}

		return timeQuery;
	}

	private buildSearchQuery(): any {
		let query: any = {};

		if (null != this.queryUserObj && null != this.queryUserObj.item._id) {
			query['audit.actor._id'] = {
				$obj: this.queryUserObj.item._id
			};
		}

		let selectedActions = this.actionOptions.filter((opt) => opt.selected);
		if (selectedActions.length > 0) {
			query['audit.action'] = {
				$in: selectedActions.map((opt) => opt.display)
			};
		}

		let selectedAuditTypes = this.auditTypeOptions.filter((opt) => opt.selected);
		if (selectedAuditTypes.length > 0) {
			query['audit.auditType'] = {
				$in: selectedAuditTypes.map((opt) => opt.display)
			};
		}

		let created = this.getTimeFilterQueryObject();
		if (null != created) {
			query.created = created;
		}

		return query;
	}

	private loadAuditEntries() {
		let query = this.buildSearchQuery();

		this.auditService.search(query, '', this.pagingOpts)
			.subscribe((result: any) => {
				if (null != result && null != result.elements && result.elements.length > 0) {
					// Defensively filter out bad audit entries (null or audit or audit.object object is null)
					this.auditEntries = result.elements
						.filter((e: any) => (null != e && null != e.audit && null != e.audit.object));

					this.pagingOpts.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
					this.auditEntriesLoaded = true;
				}
				else {
					this.auditEntries = [];
					this.pagingOpts.reset();
					this.auditEntriesLoaded = false;
				}
			});
	}
}
