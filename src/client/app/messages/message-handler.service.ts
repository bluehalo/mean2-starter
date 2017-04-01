import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { ToasterService, Toast, BodyOutputType } from 'angular2-toaster';

import { MessageService } from './message.service';
import { Message, MessageType } from './message.class';

import { AuthenticationService } from 'app/admin/authentication/authentication.service';
import { UserStateService } from 'app/admin/authentication/user-state.service';

@Injectable()
export class MessageHandlerService {
	private subscribed: boolean = false;

	private newMessages: boolean = false;

	constructor(
		private userStateService: UserStateService,
		private authentication: AuthenticationService,
		private toasterService: ToasterService,
		private messageService: MessageService) {
	}

	public initialize() {
		this.messageService.initialize();

		this.authentication.initializing$
			.subscribe(() => {
				if (this.userStateService.user.isActive()) {
					if (this.subscribed) {
						return;
					}
					this.subscribed = true;

					// Check for new messages
					let messagesViewed = this.userStateService.user.userModel.messagesViewed;
					let query = {};
					if (undefined !== messagesViewed) {
						query = {'created': {'$gte': this.userStateService.user.userModel.messagesViewed}};
					}
					this.messageService.search(query, null)
						.subscribe((messages) => {
							if (messages.totalSize === 0) {
								return;
							}

							if (messages.totalSize === 1) {
								let message: Message = <Message> messages.elements[0];
								this.showToaster(message);
								this.newMessages = true;
							} else {
								let toast: Toast = {
									type: 'info',
									title: 'New messages',
									timeout: 0,
									bodyOutputType: BodyOutputType.TrustedHtml,
									body: `<div>You have ${messages.totalSize} new messages</div><div><a class="toast-message-link" href="#/welcome">View messages</a></div>`
								};
								this.toasterService.pop(toast);
								this.newMessages = true;

							}
						});

					// Register for new notifications from the websocket
					this.messageService.subscribe();
					this.messageService.messageReceived
						.subscribe((message: any) => {
							this.showToaster(message);
							this.newMessages = true;
						});
				}
			});
	}

	private showToaster(message: Message) {
		let popupBody: any;
		if (_.isString(message.tearline) && message.tearline.trim().length > 0) {
			popupBody = `${message.tearline} <br/>`;
		}
		else {
			popupBody = '';
		}

		let html = `<div>${popupBody}<div class="pull-right"><a class="toast-message-link" href="#/welcome">View messages</a></div><br/></div>`;
		let toast: Toast = {
			type: this.getToastType(message),
			title: message.title,
			showCloseButton: true,
			body: html,
			timeout: 0,
			bodyOutputType: BodyOutputType.TrustedHtml,
			onHideCallback: () => this.markAllRead()
		};

		this.toasterService.pop(toast);
	};

	private markAllRead() {
		this.newMessages = false;
		this.messageService.markAllRead();
	};

	private getToastType(message: Message): string {
		switch (message.type) {
			case MessageType.ERROR:
				return 'error';
			case MessageType.INFO:
				return 'info';
			case MessageType.WARN:
				return 'warning';
			default:
				return 'unknown';
		}
	}

}
