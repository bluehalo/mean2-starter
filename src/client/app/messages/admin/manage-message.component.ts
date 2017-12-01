import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { Message } from '../message.class';
import { ConfigService } from '../../core/config.service';
import { AlertService } from '../../shared/alert.service';

export abstract class ManageMessageComponent {

	message: Message;

	error: string = null;

	okDisabled: boolean;

	// Variables that will be set by implementing classes
	title: string;

	subtitle: string;

	okButtonText: string;

	typeOptions: any[] = [
		{ value: 'MOTD', display: 'MOTD' },
		{ value: 'INFO', display: 'INFO' },
		{ value: 'WARN', display: 'WARN' },
		{ value: 'ERROR', display: 'ERROR' }
	];

	protected config: any;

	protected navigateOnSuccess: string;

	constructor(
		protected router: Router,
		protected configService: ConfigService,
		public alertService: AlertService
	) {}

	ngOnInit() {
		this.configService.getConfig().first().subscribe((config: any) => {
			this.config = config;
			this.initialize();
		});
	}

	abstract initialize(): void;

	abstract submitMessage(message: Message): Observable<any>;

	submit() {
		this.submitMessage(this.message).subscribe(
			() => this.router.navigate([this.navigateOnSuccess]),
			(error: HttpErrorResponse) => {
				if (error.status >= 400 && error.status < 500) {
					this.error = error.error.message;
				}
			});
	}
}
