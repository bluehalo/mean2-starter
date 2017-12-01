import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';

import { AsyHttp, HttpOptions } from '../../shared/asy-http.service';
import { IPagingResults, NULL_PAGING_RESULTS, PagingOptions } from '../../shared/pager.component';
import { AlertService } from '../../shared/alert.service';

@Injectable()
export class FeedbackService {

	static feedbackQuery = { 'audit.auditType': 'feedback' };

	constructor(
		private asyHttp: AsyHttp,
		private alertService: AlertService
	) {}

	submit(feedback: string, url: string): Observable<any> {
		return this.asyHttp.post(new HttpOptions('feedback', () => {}, { body: feedback, url: url }));
	}

	getFeedback(paging: PagingOptions): Observable<IPagingResults> {
		return this.asyHttp.post(new HttpOptions('audit/feedback?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { q: FeedbackService.feedbackQuery }))
			.map((result: IPagingResults) => {
				if (null != result && Array.isArray(result.elements)) {
					result.elements = result.elements.map((e: any) => ({
						actorName: _.get(e, 'audit.actor.name', null),
						actorEmail: _.get(e, 'audit.actor.email', null),
						body: _.get(e, 'audit.object.body', null),
						url: _.get(e, 'audit.object.url', null),
						created: moment(e.created).toISOString()
					}));
				}

				return result;
			})
			.catch((error: HttpErrorResponse) => {
				this.alertService.addAlert(error.error.message);
				return Observable.of(NULL_PAGING_RESULTS);
			});
	}
}
