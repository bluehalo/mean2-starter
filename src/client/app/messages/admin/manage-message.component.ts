import { Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Message } from '../message.class';
import { ConfigService } from '../../core/config.service';
import { AlertService } from '../../shared/alert.service';

export abstract class ManageMessageComponent {

	protected config: any;
	protected error: string = null;
	protected okDisabled: boolean;

	// Variables that will be set by implementing classes
	protected title: string;
	protected subtitle: string;
	protected okButtonText: string;
	protected navigateOnSuccess: string;
	protected message: Message;

	protected typeOptions: any[] = [
		{ value: 'MOTD', display: 'MOTD' },
		{ value: 'INFO', display: 'INFO' },
		{ value: 'WARN', display: 'WARN' },
		{ value: 'ERROR', display: 'ERROR' }
	];

	constructor(
		protected router: Router,
		protected configService: ConfigService,
		protected alertService: AlertService
	) {}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe((config: any) => {
				this.config = config;

				this.initialize();
			});
	}

	abstract initialize(): void;

	abstract submitMessage(message: Message): Observable<Response>;

	private submit() {
		this.submitMessage(this.message)
			.subscribe(
				() => this.router.navigate([this.navigateOnSuccess]),
				(response: Response) => {
					if (response.status >= 400 && response.status < 500) {
						let errors = response.json().message.split('\n');
						this.error = errors.join(', ');
					}
				});
	}

}
