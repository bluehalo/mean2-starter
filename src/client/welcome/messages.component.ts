import { Component } from '@angular/core';

import { Message, MessageType } from '../messages/message.class';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { ConfigService } from '../core/config.service';
import { AlertService } from '../shared/alert.service';
import { MessageService } from '../messages/message.service';
import { PagingOptions } from '../shared/pager.component';
import * as _ from 'lodash';

@Component({
	selector: 'messages',
	templateUrl: './messages.component.html'
})
export class MessagesComponent {

	private messages: Message[];
	private motd: Message;

	constructor(
		private auth: AuthenticationService,
		private configService: ConfigService,
		private alertService: AlertService,
		private messageService: MessageService
	) {}

	ngOnInit() {
		this.messages = [];

		this.messageService.messageReceived
			.subscribe( () => {
				// Redo search on a new message
				this.search();
			});

		this.search();
	}

	private search() {
		this.messageService.search({}, '', new PagingOptions(0, 10000))
			.subscribe( (result: any) => {
				if (result.totalSize === 0) {
					return;
				}

				let messages = _.orderBy(result.elements, ['created'], ['desc']);
				// find the first motd
				let motdIdx = _.findIndex(messages, function(msg: Message) {
					return msg.type === MessageType.MOTD;
				});
				if (motdIdx >= 0) {
					this.motd = <Message> messages.splice(motdIdx, 1)[0];
				}
				this.messages = <Message[]> messages;
			});
	}

	private getTypeAlertClass(message: Message) {
		switch (MessageType[message.type].toLowerCase()) {
			case 'motd':
				return 'motd';
			case 'info':
				return 'info';
			case 'warn':
				return 'warning';
			case 'error':
				return 'danger';
			default:
				return 'unknown';
		}
	}

	private getTypeIcon(message: Message) {
		switch (MessageType[message.type].toLowerCase()) {
			case 'motd':
				return 'fa-info-circle';
			case 'info':
				return 'fa-info-circle';
			case 'warn':
				return 'fa-exclamation-circle';
			case 'error':
				return 'fa-exclamation-triangle';
			default:
				return 'unknown';
		}
	}
};
