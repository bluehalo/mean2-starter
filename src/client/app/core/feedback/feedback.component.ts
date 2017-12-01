import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { BsModalRef } from 'ngx-bootstrap';

import { ConfigService } from '../config.service';
import { StringUtils } from '../../shared/string-utils.service';
import { FeedbackService } from './feedback.service';

@Component({
	templateUrl: 'feedback.component.html'
})
export class FeedbackModalComponent {

	error: string;

	success: string;

	appName: string;

	feedbackText: string;

	submitting: boolean = false;

	private currentRoute: string;

	constructor(
		private router: Router,
		private configService: ConfigService,
		private feedbackService: FeedbackService,
		public modalRef: BsModalRef
	) {
		this.configService.getConfig().first().subscribe((config: any) => {
			this.appName = config.app.title;
			this.currentRoute = `${config.app.baseUrl}${this.router.url}`;
		});
	}

	submit() {
		if (StringUtils.isNonEmptyString(this.feedbackText)) {
			this.error = null;
			this.submitting = true;
			this.feedbackService.submit(this.feedbackText, this.currentRoute).subscribe(() => {
				this.success = 'Feedback successfully submitted!';
				setTimeout(() => this.modalRef.hide(), 1500);
			}, (error: HttpErrorResponse) => {
				this.submitting = false;
				this.error = error.error.message;
			});
		}
		else {
			this.error = 'Cannot submit empty feedback.';
		}
	}
}
