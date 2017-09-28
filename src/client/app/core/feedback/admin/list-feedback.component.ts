import { Component } from '@angular/core';
import { Response } from '@angular/http';

import * as _ from 'lodash';
import * as moment from 'moment';

import { PagingOptions } from '../../../shared/pager.component';
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
		this.feedbackService.getFeedback(this.pagingOpts).subscribe((results: any) => {
			if (null != results && null != results.elements && results.elements.length > 0) {
				this.feedbacks = results.elements.map((e: any) => ({
					actorName: _.get(e, 'audit.actor.name', null),
					actorEmail: _.get(e, 'audit.actor.email', null),
					body: _.get(e, 'audit.object.body', null),
					url: _.get(e, 'audit.object.url', null),
					created: moment(e.created).toISOString()
				}));

				this.pagingOpts.set(results.pageNumber, results.pageSize, results.totalPages, results.totalSize);
			}
			else {
				this.feedbacks = [];
				this.pagingOpts.reset();
			}
		}, (response: Response) => {
			this.alertService.addAlertResponse(response);
		});
	}
}
