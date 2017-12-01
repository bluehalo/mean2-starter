import { Component } from '@angular/core';

import * as _ from 'lodash';

import { IPagingResults, PagingOptions } from '../../../shared/pager.component';
import { TableSortOptions } from '../../../shared/pageable-table/pageable-table.component' ;
import { SortDirection, SortDisplayOption } from '../../../shared/result-utils.class';
import { AlertService } from '../../../shared/alert.service';
import { FeedbackService } from '../feedback.service';
import { ExportConfigService } from '../../../shared/export-config.service';

@Component({
	templateUrl: 'list-feedback.component.html'
})
export class ListFeedbackComponent {

	feedbacks: any[];

	pagingOpts: PagingOptions;

	columns = {
		'actor': { show: true, title: 'Submitted By'},
		'email': { show: true, title: 'Email'},
		'body': { show: true, title: 'Feedback'},
		'url': {show: true, title: 'Submitted From'},
		'created': {show: true, title: 'Submission Time'}
	};

	columnKeys = _.keys(this.columns);

	sortOpts: TableSortOptions = {
		created: new SortDisplayOption('Submission Time', 'created', SortDirection.desc),
		actor: new SortDisplayOption('Actor Name', 'audit.actor', SortDirection.asc)
	};

	constructor(
		private feedbackService: FeedbackService,
		private exportConfigService: ExportConfigService,
		public alertService: AlertService
	) {
		this.alertService.clearAllAlerts();

		this.pagingOpts = new PagingOptions();
		this.pagingOpts.sortField = this.sortOpts['created'].sortField;
		this.pagingOpts.sortDir = this.sortOpts['created'].sortDir;

		this.loadFeedbackEntries();
	}

	goToPage(event: any) {
		this.pagingOpts.update(event.pageNumber, event.pageSize);
		this.loadFeedbackEntries();
	}

	setSort(sortOpt: SortDisplayOption) {
		this.pagingOpts.sortField = sortOpt.sortField;
		this.pagingOpts.sortDir = sortOpt.sortDir;
		this.loadFeedbackEntries();
	}

	export() {
		this.exportConfigService
			.postExportConfig('feedback', { q: FeedbackService.feedbackQuery, sort: this.pagingOpts.sortField, dir: this.pagingOpts.sortDir })
			.subscribe((response: any) => {
				window.open(`/admin/feedback/csv/${response._id}`);
			});
	}

	private loadFeedbackEntries() {
		this.feedbackService.getFeedback(this.pagingOpts).subscribe((result: IPagingResults) => {
			this.feedbacks = result.elements;
			if (this.feedbacks.length > 0) {
				this.pagingOpts.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
			}
			else {
				this.pagingOpts.reset();
			}
		});
	}
}
