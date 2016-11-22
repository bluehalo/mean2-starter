import { Component, forwardRef, Inject } from '@angular/core';
import { ManageMessageComponent } from './manage-message.component';
import { Router } from '@angular/router';
import { MessageService } from '../message.service';
import { Message, MessageType } from '../message.class';
import { ConfigService } from '../../core/config.service';
import { AlertService } from '../../shared/alert.service';

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
		this.navigateOnSuccess = '/admin/messages';
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
