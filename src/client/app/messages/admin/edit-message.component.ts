import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ManageMessageComponent } from './manage-message.component';
import { MessageService } from '../message.service';
import { Message } from '../message.class';
import { ConfigService } from '../../core/config.service';
import { AlertService } from '../../shared/alert.service';

@Component({
	templateUrl: './manage-message.component.html'
})
export class UpdateMessageComponent extends ManageMessageComponent {

	mode = 'admin-edit';

	id: string;

	constructor(
		public router: Router,
		public route: ActivatedRoute,
		public configService: ConfigService,
		public alertService: AlertService,
		public messageService: MessageService
	) {
		super(router, configService, alertService);
	}

	initialize() {
		this.route.params.subscribe((params: Params) => {
			this.id = params[`id`];

			this.title = 'Edit Message';
			this.subtitle = 'Make changes to the message\'s information';
			this.okButtonText = 'Save';
			this.navigateOnSuccess = '/admin/messages';
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
