import { Observable } from 'rxjs/Observable';
import { Component } from '@angular/core';
import { AuditService } from '../services/audit.client.service';
import { Modal } from 'angular2-modal/plugins/bootstrap';
import { overlayConfigFactory } from 'angular2-modal';
import 'rxjs/Rx';

import {
	AuditViewDetailModalContext, AuditViewChangeModal,
	AuditViewDetailModal
} from './audit-view-change.client.component';
import { PagingOptions } from '../../shared/pager.component';
import { SortDisplayOption, SortDirection } from '../../shared/result-utils.class';
import { UserService } from '../../admin/users.service';
import { AuthenticationService } from '../../admin/authentication/authentication.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AuditOption } from '../model/audit.classes';

@Component({
	selector: 'audit',
	templateUrl: '../views/audit-list.client.view.html'
})
export class AuditComponent {

	// List of audit entries
	private auditEntries: any[] = [];

	private auditEntriesLoaded: boolean = false;

	private actionOptions: AuditOption[] = [];

	private auditTypeOptions: AuditOption[] = [];

	private queryUserSearchTerm: string = '';

	private queryUserObj: any;

	// Search phrase
	private search: string = '';

	private pagingOpts: PagingOptions;

	private userPagingOpts: PagingOptions;

	private sortOpts = {
		created: new SortDisplayOption('Created', 'created', SortDirection.desc),
		actor: new SortDisplayOption('Actor', 'audit.actor.name', SortDirection.asc),
		type: new SortDisplayOption('Type', 'audit.auditType', SortDirection.desc)
	};

	private dateRangeOptions: any[];

	private dateRangeFilter: any;

	// Date picker
	private showGteDatepicker: boolean = false;
	private showLteDatepicker: boolean = false;

	private queryStartDate: Date = moment.utc().subtract(1, 'days').toDate();

	private queryEndDate: Date = moment.utc().toDate();


	private searchUsersRef = this.searchUsers.bind(this);

	constructor(
		private auditService: AuditService,
		private userService: UserService,
		public auth: AuthenticationService,
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
		this.pagingOpts.sortField = this.sortOpts.created.sortField;
		this.pagingOpts.sortDir = this.sortOpts.created.sortDir;

		this.userPagingOpts = new PagingOptions(0, 20);
		this.userPagingOpts.sortField = 'username';
		this.userPagingOpts.sortDir = SortDirection.asc;

		// Default date range to last day
		this.dateRangeFilter = {
			selected: this.dateRangeOptions[0].value
		};

		// Load action and audit type options from the server
		Observable.forkJoin([this.auditService.getDistinctAuditValues('audit.action'), this.auditService.getDistinctAuditValues('audit.auditType')])
			.subscribe((results: any[]) => {
				this.actionOptions = results[0].filter((r: any) => _.isString(r)).sort().map((r: any) => new AuditOption(r));
				this.auditTypeOptions = results[1].filter((r: any) => _.isString(r)).sort().map((r: any) => new AuditOption(r));
			});

		this.loadAuditEntries();
	}

	private goToPage(event: any) {
		this.pagingOpts.update(event.pageNumber, event.pageSize);
		this.loadAuditEntries();
	}

	private setSort(name: string) {
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

	private updateDateRange() {
		this.showGteDatepicker = false;
		this.showLteDatepicker = false;
		this.loadAuditEntries();
	}

	private typeaheadOnSelect(e: any) {
		this.queryUserObj = e;
		this.refresh();
	}

	private searchUsers() {
		return this.userService.match({}, this.queryUserSearchTerm, this.userPagingOpts)
			.map((result) => {
				return (<any> result.elements).map(function(r: any) {
					r.displayName = r.name + ' [' + r.username + ']';
					return r;
				});
			}).toPromise();
	}

	private viewMore(auditEntry: any, type: string) {
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

	private refresh() {
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
			if (!_.isNull(this.queryStartDate)) {
				timeQuery = (_.isNull(timeQuery)) ? {} : timeQuery;
				timeQuery.$gte = moment.utc(this.queryStartDate).startOf('day');
			}
			if (!_.isNull(this.queryEndDate)) {
				timeQuery = (_.isNull(timeQuery)) ? {} : timeQuery;
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
