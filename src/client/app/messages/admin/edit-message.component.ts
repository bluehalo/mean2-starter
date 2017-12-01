import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { ManageMessageComponent } from './manage-message.component';
import { MessageService } from '../message.service';
import { Message } from '../message.class';
import { ConfigService } from '../../core/config.service';
import { AlertService } from '../../shared/alert.service';

@Component({
	templateUrl: 'manage-message.component.html'
})
export class UpdateMessageComponent extends ManageMessageComponent {

	mode = 'admin-edit';

	private id: string;

	private routeParamsSubscription: Subscription;

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected configService: ConfigService,
		public alertService: AlertService,
		protected messageService: MessageService
	) {
		super(router, configService, alertService);
	}

	ngOnDestroy() {
		if (this.routeParamsSubscription) {
			this.routeParamsSubscription.unsubscribe();
		}
	}

	initialize() {
		this.routeParamsSubscription = this.route.params
			.do((params: Params) => {
				this.id = params[`id`];

				this.title = 'Edit Message';
				this.subtitle = 'Make changes to the message\'s information';
				this.okButtonText = 'Save';
				this.navigateOnSuccess = '/admin/messages';
				this.okDisabled = false;
			})
			.switchMap(() => this.messageService.get(this.id))
			.subscribe((message: Message) => this.message = message);
	}

	submitMessage(message: Message): Observable<any> {
		return this.messageService.update(message);
	}

}
