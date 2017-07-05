import { Component, Input } from '@angular/core';
import { Response } from '@angular/http';
import { ActivatedRoute, Params } from '@angular/router';

import { Modal } from 'angular2-modal/plugins/bootstrap';

import { User } from 'app/admin';
import {
	PagingOptions, TableSortOptions,
	SortDirection, SortDisplayOption,
	AlertService
} from 'app/shared';

import { AuthenticationService } from 'app/admin/authentication/authentication.service';
import { TagsService } from './tags.service';

@Component({
	selector: 'list-tags',
	templateUrl: './list-tags.component.html'
})
export class ListTagsComponent {

	@Input() readOnly: boolean = true;

	tags: any[] = [];

	teamId: string;

	user: User;

	search: string;

	sortOptions: TableSortOptions = {};

	pagingOptions: PagingOptions;

	maxResourcesShownInline = 3;

	loading: boolean = false;

	constructor(
		public modal: Modal,
		public route: ActivatedRoute,
		public alertService: AlertService,
		public auth: AuthenticationService,
		public tagsService: TagsService
	) {
	}

	ngOnInit() {
		this.user = this.auth.getCurrentUser();

		this.sortOptions.name = new SortDisplayOption('Name', 'name', SortDirection.asc);
		this.sortOptions.created = new SortDisplayOption('Created', 'created', SortDirection.desc);
		this.sortOptions.updated = new SortDisplayOption('Updated', 'updated', SortDirection.desc);

		this.pagingOptions = new PagingOptions();
		this.pagingOptions.sortField = this.sortOptions.name.sortField;
		this.pagingOptions.sortDir = this.sortOptions.name.sortDir;

		this.route.params.subscribe(
			(params: Params) => {
				this.teamId = params[`id`];
				this.getTags();
			});
	}

	getTags() {
		let query: any = {
			owner: {'$in': this.teamId}
		};
		let options: any = {};

		this.loading = true;
		this.tagsService.searchTags(query, this.search, this.pagingOptions, options)
			.subscribe(
				(result: any) => {
					if (null != result && null != result.elements && result.elements.length > 0) {
						this.tags = result.elements;
						this.pagingOptions.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
					} else {
						this.tags = [];
						this.pagingOptions.reset();
					}
				},
				(err: any) => {
					this.loading = false;
				},
				() => {
					this.loading = false;
				});
	}

	goToPage(event: any) {
		this.pagingOptions.update(event.pageNumber, event.pageSize);
		this.getTags();
	}

	applySearch() {
		this.pagingOptions.setPageNumber(0);
		this.getTags();
	}

	setSort(sortOpt: SortDisplayOption) {
		if (sortOpt.sortField === this.pagingOptions.sortField) {
			this.pagingOptions.sortDir = (this.pagingOptions.sortDir === SortDirection.asc) ? SortDirection.desc : SortDirection.asc;
		} else {
			this.pagingOptions.sortField = sortOpt.sortField;
			this.pagingOptions.sortDir = sortOpt.sortDir;
		}
		this.getTags();
	};

	removeTag(tag: any) {
		this.modal.confirm()
			.size('lg')
			.showClose(true)
			.isBlocking(true)
			.title('Remove tag from team?')
			.body(`Are you sure you want to remove tag: "${tag.name}" from this team?`)
			.okBtn('Remove Tag')
			.open()
			.then(
				(resultPromise: any) => resultPromise.result.then(
					() => {
						this.tagsService.deleteTag(tag._id)
							.subscribe(
								() => {
									this.getTags();
								},
								(response: Response) => {
									if (response.status >= 400 && response.status < 500) {
										this.alertService.addAlert(response.json().message);
									}
								});
					},
					() => {}
				)
			);
	}
}
