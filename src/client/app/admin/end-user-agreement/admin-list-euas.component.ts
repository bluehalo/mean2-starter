import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Response } from '@angular/http';

import * as _ from 'lodash';
import { DialogRef } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap';

import { EndUserAgreement } from './eua.class';
import { EuaService } from './eua.service';
import { AdminService } from '../admin.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { PagingOptions } from 'app/shared/pager.component';
import { TableSortOptions } from 'app/shared/pageable-table/pageable-table.component';
import { SortDisplayOption, SortDirection } from 'app/shared/result-utils.class';
import { AlertService } from 'app/shared/alert.service';

@Component({
	selector: 'admin-list-euas',
	templateUrl: './admin-list-euas.component.html'
})
export class AdminListEuasComponent implements OnInit {
	agree: boolean = false;
	pagingOpts: PagingOptions;
	euaToDelete: EndUserAgreement;
	euas: EndUserAgreement[] = [];
	search: string = '';

	// Columns to show/hide in user table
	columns = {
		_id: false,
		created: true,
		published: true,
		text: false,
		title: true,
		updated: true
	};

	sortOpts: TableSortOptions = {
		title: new SortDisplayOption('Name', 'name', SortDirection.asc),
		created: new SortDisplayOption('Created', 'created', SortDirection.desc),
		updated: new SortDisplayOption('Updated', 'updated', SortDirection.desc),
		published: new SortDisplayOption('Published', 'published', SortDirection.desc),
		relevance: new SortDisplayOption('Relevance', 'score', SortDirection.desc)
	};

	constructor(
		public adminService: AdminService,
		public auth: AuthenticationService,
		public alertService: AlertService,
		public euaService: EuaService,
		private route: ActivatedRoute,
		private modal: Modal
	) {}

	ngOnInit() {
		this.alertService.clearAllAlerts();
		this.route.params.subscribe( (params: Params) => {
			if (_.toString(params[`clearCachedFilter`]) === 'true' || null == this.euaService.cache.listEuas) {
				this.euaService.cache.listEuas = {};
			}
		});

		this.initializeUserFilters();

		this.loadEuas();
	}

	/**
	 * Initialize query, search, and paging options, possibly from cached user settings
	 */
	initializeUserFilters() {
		let cachedFilter = this.euaService.cache.listEuas;

		this.search = cachedFilter.search ? cachedFilter.search : '';

		if (cachedFilter.paging) {
			this.pagingOpts = cachedFilter.paging;
		} else {
			this.pagingOpts = new PagingOptions();
			this.pagingOpts.sortField = this.sortOpts['title'].sortField;
			this.pagingOpts.sortDir = this.sortOpts['title'].sortDir;
		}
	}

	applySearch() {
		this.pagingOpts.setPageNumber(0);
		this.loadEuas();
	}

	goToPage(event: any) {
		this.pagingOpts.update(event.pageNumber, event.pageSize);
		this.loadEuas();
	}

	setSort(sortOpt: SortDisplayOption) {
		this.pagingOpts.sortField = sortOpt.sortField;
		this.pagingOpts.sortDir = sortOpt.sortDir;
		this.loadEuas();
	}

	confirmDeleteEua(eua: EndUserAgreement) {
		this.euaToDelete = eua;

		let dialogPromise: Promise<DialogRef<any>>;
		dialogPromise = this.modal.confirm()
			.size('lg')
			.showClose(true)
			.isBlocking(true)
			.title('Delete End User Agreement?')
			.body(`Are you sure you want to delete eua: "${eua.euaModel.title}" ?`)
			.okBtn('Delete')
			.open();

		dialogPromise.then(
			(resultPromise: any) => resultPromise.result.then(
				// Success
				() => {
					let id = eua.euaModel._id;
					let title = eua.euaModel.title;
					this.euaService.remove(id).subscribe(
						() => {
							this.alertService.addAlert(`Deleted EUA entitled: ${title}`, 'success');
							this.loadEuas();
						},
						(response: Response) => {
							if (response.status >= 400 && response.status < 500) {
								this.alertService.addAlert(response.json().message);
							}
						});
				},
				// Fail
				() => {}
			)
		);
	}

	publishEua(eua: EndUserAgreement) {
		this.euaService.publish(eua.euaModel._id).subscribe(
			() => {
				this.alertService.addAlert(`Published ${eua.euaModel.title}`, 'success');
			},
			(response: Response) => {
				if (response.status >= 400 && response.status < 500) {
					this.alertService.addAlert(response.json().message);
				}
			});
		this.loadEuas();
	}

	private loadEuas() {
		let options: any = {};
		this.euaService.cache.listEuas = {search: this.search, paging: this.pagingOpts};
		this.euaService.search(this.getQuery(), this.search, this.pagingOpts, options)
			.subscribe((result: any) => {
				if (result && Array.isArray(result.elements)) {
					this.euas = result.elements.map((element: any) => new EndUserAgreement().setFromEuaModel(element));
					this.pagingOpts.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
				} else {
					this.pagingOpts.reset();
					this.euas = [];
				}
			});
	}

	private getQuery(): any {
		let query: any;
		let elements: any[] = [];

		if (elements.length > 0) {
			query = { $or: elements };
		}
		return query;
	}

}
