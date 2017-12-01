import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import * as _ from 'lodash';
import { Subscription } from 'rxjs/Subscription';

import { EndUserAgreement } from './eua.class';
import { EuaService } from './eua.service';
import { IPagingResults, PagingOptions } from '../../shared/pager.component';
import { TableSortOptions } from '../../shared/pageable-table/pageable-table.component';
import { SortDisplayOption, SortDirection } from '../../shared/result-utils.class';
import { AlertService } from '../../shared/alert.service';
import { ModalAction, ModalService } from '../../shared/asy-modal.service';

@Component({
	selector: 'admin-list-euas',
	templateUrl: 'admin-list-euas.component.html'
})
export class AdminListEuasComponent implements OnInit {

	pagingOpts: PagingOptions;

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

	private routeParamSubscription: Subscription;

	constructor(
		private asyModalService: ModalService,
		private euaService: EuaService,
		private route: ActivatedRoute,
		public alertService: AlertService,
	) {}

	ngOnInit() {
		this.alertService.clearAllAlerts();
		this.routeParamSubscription = this.route.params.subscribe( (params: Params) => {
			if (_.toString(params[`clearCachedFilter`]) === 'true' || null == this.euaService.cache.listEuas) {
				this.euaService.cache.listEuas = {};
			}
		});

		this.initializeUserFilters();
		this.loadEuas();
	}

	ngOnDestroy() {
		this.routeParamSubscription.unsubscribe();
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
		const id = eua.euaModel._id;
		const title = eua.euaModel.title;

		this.asyModalService
			.confirm('Delete End User Agreement?', `Are you sure you want to delete eua: "${eua.euaModel.title}" ?`, 'Delete')
			.first()
			.filter((action: ModalAction) => action === ModalAction.OK)
			.switchMap(() => this.euaService.remove(id))
			.subscribe(() => {
				this.alertService.addAlert(`Deleted EUA entitled: ${title}`, 'success');
				this.loadEuas();
			}, (error: HttpErrorResponse) => this.alertService.addClientErrorAlert(error));
	}

	publishEua(eua: EndUserAgreement) {
		this.euaService.publish(eua.euaModel._id).subscribe(() => {
			this.alertService.addAlert(`Published ${eua.euaModel.title}`, 'success');
			this.loadEuas();
		}, (error: HttpErrorResponse) => this.alertService.addClientErrorAlert(error));
	}

	/**
	 * Initialize query, search, and paging options, possibly from cached user settings
	 */
	private initializeUserFilters() {
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

	private loadEuas() {
		let options: any = {};
		this.euaService.cache.listEuas = {search: this.search, paging: this.pagingOpts};
		this.euaService.search(this.getQuery(), this.search, this.pagingOpts, options).subscribe((result: IPagingResults) => {
			this.euas = result.elements;
			if (this.euas.length > 0) {
				this.pagingOpts.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
			}
			else {
				this.pagingOpts.reset();
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
