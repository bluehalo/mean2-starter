import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ManageMessageComponent } from './manage-message.component';
import { ConfigService } from '../../core/services/config.client.service';
import { AlertService } from '../../shared/services/alert.client.service';
import { MessageService } from '../message.service';
import { Message } from '../message.class';

@Component({
	selector: 'admin-edit-user',
	templateUrl: './manage-message.component.html'
})
export abstract class AdminUpdateMessageComponent extends ManageMessageComponent {

	private mode = 'admin-edit';

	private id: string;

	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected configService: ConfigService,
		protected alertService: AlertService,
		protected messageService: MessageService
	) {
		super(router, configService, alertService);
	}

	initialize() {
		this.route.params.subscribe((params: Params) => {
			this.id = params[`id`];

			this.title = 'Edit Message';
			this.subtitle = 'Make changes to the message\'s information';
			this.okButtonText = 'Save';
			this.navigateOnSuccess = 'AdminListMessages';
			this.okDisabled = false;
			this.messageService.get(this.id).subscribe((messageRaw: any) => {
				this.message = new Message().setFromModel(messageRaw);
			});
		});

	}

	submitMessage(message: Message) {
		return this.messageService.update(message);
	}

}
