import { ActivatedRoute, Params } from '@angular/router';
import { Component } from '@angular/core';
import { Response } from '@angular/http';

import * as _ from 'lodash';

import { Message } from '../message.class';
import { MessageService } from '../message.service';
import { PagingOptions } from '../../shared/pager.component';
import { TableSortOptions } from '../../shared/pageable-table/pageable-table.component';
import { SortDirection, SortDisplayOption } from '../../shared/result-utils.class';
import { AlertService } from '../../shared/alert.service';
import { ModalAction, ModalService } from '../../shared/asy-modal.service';

@Component({
	templateUrl: './list-messages.component.html'
})
export class ListMessagesComponent {

	messages: Message[] = [];
	pagingOpts: PagingOptions;
	search: string = '';
	filters: any = {};
	sort: any;

	// Columns to show/hide in user table
	columns = {
		'title': {show: true, title: 'Title'},
		'tearline': {show: true, title: 'Tearline'},
		'type': {show: true, title: 'Type'},
		'created': {show: true, title: 'Created'},
		'updated': {show: false, title: 'Updated'},
		'_id': {show: false, title: 'ID'}
	};

	columnKeys = _.keys(this.columns);
	defaultColumns = JSON.parse(JSON.stringify(this.columns));
	columnMode = 'default';

	sortOpts: TableSortOptions = {
		created: new SortDisplayOption('Created', 'created', SortDirection.desc),
		title: new SortDisplayOption('Title', 'title', SortDirection.asc),
		type: new SortDisplayOption('Type', 'Type', SortDirection.asc),
		updated: new SortDisplayOption('Updated', 'updated', SortDirection.desc)
	};

	results: any = {
		pageNumber: 0, // The current page number
		pageSize: 0,   // The number of elements in the current page
		totalPages: 0, // The total number of pages
		totalSize: 0,   // The total number of elements in the set
		resolved: false // indicates if search query has completed or is running
	};

	constructor(
		private messageService: MessageService,
		public alertService: AlertService,
		private modalService: ModalService,
		private route: ActivatedRoute) {
	}

	ngOnInit() {
		this.alertService.clearAllAlerts();
		this.route.params.subscribe((params: Params) => {
			if (_.toString(params[`clearCachedFilter`]) === 'true' || null == this.messageService.cache.listMessages) {
				this.messageService.cache.listMessages = {};
			}

			this.initializeMessageFilters();
			this.applySearch();
		});
	}

	/**
	 * Initialize query, search, and paging options, possibly from cached user settings
	 */
	initializeMessageFilters() {
		let cachedFilter: any = this.messageService.cache.listMessages as any;

		this.search = cachedFilter.search ? cachedFilter.search : '';
		this.filters = cachedFilter.filters ? cachedFilter.filters : {};

		if (cachedFilter.paging) {
			this.pagingOpts = cachedFilter.paging;
		}
		else {
			this.pagingOpts = new PagingOptions();
			this.pagingOpts.sortField = this.sortOpts['created'].sortField;
			this.pagingOpts.sortDir = this.sortOpts['created'].sortDir;
		}

		this.sort = this.messageService.sort.map;
	}

	getQuery() {
		return {};
	}

	applySearch() {
		this.results.resolved = false;

		this.messageService.cache.messages = {search: this.search, paging: this.pagingOpts};
		this.messageService.search(this.getQuery(), this.search, this.pagingOpts)
			.subscribe((result: any) => {
				if (null != result) {
					this.messages = result.elements;
					this.pagingOpts.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
				} else {
					this.messages = [];
				}

				this.results.resolved = true;
			}, (error) => {
				this.alertService.addAlert(error.message);
				this.results.resolved = true;
			});
	}

	goToPage(event: any) {
		this.pagingOpts.update(event.pageNumber, event.pageSize);
		this.applySearch();
	}

	setSort(sortOpt: SortDisplayOption) {
		this.pagingOpts.sortField = sortOpt.sortField;
		this.pagingOpts.sortDir = sortOpt.sortDir;
		this.applySearch();
	}

	confirmDeleteMessage(message: Message) {
		const id = message._id;

		this.modalService
			.confirm('Delete message?', `Are you sure you want to delete message: "${message.title}" ?`, 'Delete')
			.first()
			.filter((action: ModalAction) => action === ModalAction.OK)
			.switchMap(() => {
				return this.messageService.remove(id);
			})
			.subscribe(() => {
				this.alertService.addAlert(`Deleted message.`, 'success');
				this.applySearch();
			}, (response: Response) => {
				this.alertService.addAlert(response.json().message);
			});
	}

	quickColumnSelect(selection: string) {
		if (selection === 'all') {
			this.columnKeys.forEach((name: string) => this.columns[name].show = true);

		} else if (selection === 'default') {
			this.columns = JSON.parse(JSON.stringify(this.defaultColumns));
		}
		this.checkColumnConfiguration();
	}

	private checkColumnConfiguration() {
		// Check first to see if all columns are turned on
		this.columnMode = 'all';
		this.columnKeys.some((name: string) => {
			if (this.columns[name].show !== true) {
				this.columnMode = 'custom';
				return true;
			}
		});

		if (this.columnMode === 'all') { return; }
		// Check if our default columns are enabled
		this.columnMode = 'default';
		this.columnKeys.some((name: string) => {
			if (this.columns[name].show !== this.defaultColumns[name].show) {
				this.columnMode = 'custom';
				return true;
			}
		});
	}

}
