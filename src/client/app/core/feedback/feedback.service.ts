import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { AsyHttp, HttpOptions } from '../../shared/asy-http.service';
import { PagingOptions } from '../../shared/pager.component';

@Injectable()
export class FeedbackService {

	static feedbackQuery = { 'audit.auditType': 'feedback' };

	constructor(private asyHttp: AsyHttp) {}

	submit(feedback: string, url: string): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('feedback', () => {}, { body: feedback, url: url }));
	}

	getFeedback(paging: PagingOptions): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('audit/feedback?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { q: FeedbackService.feedbackQuery }));
	}
}
