import { Component, forwardRef, Inject } from '@angular/core';
import { ManageMessageComponent } from './manage-message.component';
import { Router } from '@angular/router';
import { ConfigService } from '../../core/services/config.client.service';
import { AlertService } from '../../shared/services/alert.client.service';
import { MessageService } from '../message.service';
import { Message, MessageType } from '../message.class';

@Component({
	selector: 'admin-create-user',
	templateUrl: './manage-message.component.html',
})
export class CreateMessageComponent extends ManageMessageComponent {

	private mode = 'admin-create';

	constructor(
		protected router: Router,
		protected configService: ConfigService,
		protected messageService: MessageService,
		protected alertService: AlertService) {
		super(router, configService, alertService);
	}

	initialize() {
		this.title = 'Create Message';
		this.subtitle = 'Provide the required information to create a new message';
		this.okButtonText = 'Create';
		this.navigateOnSuccess = 'AdminListMessages';
		this.message = new Message();
		this.message.type = MessageType.MOTD;
	}

	handleBypassAccessCheck() {
		// Don't need to do anything
	}

	submitMessage(message: Message) {
		return this.messageService.create(message);
	}

}
