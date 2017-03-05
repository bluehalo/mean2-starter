import { Component } from '@angular/core';
import { ManageMessageComponent } from './manage-message.component';
import { Router } from '@angular/router';
import { MessageService } from '../message.service';
import { Message, MessageType } from '../message.class';
import { ConfigService } from '../../core/config.service';
import { AlertService } from '../../shared/alert.service';

@Component({
	templateUrl: './manage-message.component.html',
})
export class CreateMessageComponent extends ManageMessageComponent {

	mode = 'admin-create';

	constructor(
		public router: Router,
		public configService: ConfigService,
		public messageService: MessageService,
		public alertService: AlertService) {
		super(router, configService, alertService);
	}

	initialize() {
		this.title = 'Create Message';
		this.subtitle = 'Provide the required information to create a new message';
		this.okButtonText = 'Create';
		this.navigateOnSuccess = '/admin/messages';
		this.message = new Message();
		this.message.type = MessageType.MOTD;
	}

	submitMessage(message: Message) {
		return this.messageService.create(message);
	}

}
