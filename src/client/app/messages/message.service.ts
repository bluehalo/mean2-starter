import { Injectable, EventEmitter } from '@angular/core';

import { HttpOptions, AsyHttp, PagingOptions } from 'app/shared';
import { SocketService } from 'app/core';

import { UserStateService } from 'app/admin/authentication';
import { UserService } from 'app/admin/user';

import { Message } from './message.class';

@Injectable()
export class MessageService {

	cache: any = {};
	sort: any = {};
	messageReceived: EventEmitter<Message> = new EventEmitter<Message>();
	private subscribed: number = 0;


	constructor(
		private asyHttp: AsyHttp,
		private socketService: SocketService,
		private userService: UserService,
		private userStateService: UserStateService) {
	}

	create(message: Message) {
		return this.asyHttp.post(new HttpOptions('admin/message', () => {
		}, message));
	}

	get(id: string) {
		return this.asyHttp.get(new HttpOptions(`admin/message/${id}`, () => {
		}, {}));
	}

	/**
	 * Retrieves an array of a field's value for all messages in the system
	 */
	getAll(query: any, field: any) {
		return this.asyHttp.post(new HttpOptions(`admin/message/getAll`, () => {
			},
			{query: query, field: field}));
	}

	update(message: Message) {
		return this.asyHttp.post(new HttpOptions(`admin/message/${message._id}`, () => {
			},
			message));
	}

	remove(id: string) {
		return this.asyHttp.delete(new HttpOptions(`admin/message/${id}`, () => {
		}, {}));
	}

	search(query: any, search: any, paging: PagingOptions = new PagingOptions()) {
		return this.asyHttp.post(new HttpOptions(`messages?${this.asyHttp.urlEncode(paging.toObj())}`, () => {
			},
			{q: query, s: search}));
	}

	/**
	 * Websocket functionality for messages
	 */
	subscribe() {
		if (this.subscribed === 0) {
			this.socketService.emit('message:subscribe');
		}
		this.subscribed++;
	}

	unsubscribe() {
		this.subscribed--;

		if (this.subscribed === 0) {
			this.socketService.emit('message:unsubscribe');
		}
		else if (this.subscribed < 0) {
			this.subscribed = 0;
		}
	}

	markAllRead() {
		this.userStateService.user.userModel.messagesViewed = new Date();
		this.userService.update(this.userStateService.user);
	}

	initialize() {
		this.sort.map = {
			title: {label: 'Title', sort: 'title', dir: 'ASC'},
			created: {label: 'Created', sort: 'created', dir: 'DESC'}
		};
		this.sort.array = [this.sort.map.title];

		// Add event listeners to the websocket, across all statuses
		this.socketService.on('message:data', this.payloadRouterFn);

		this.socketService.on('disconnect', () => {});

		this.socketService.on('reconnect', () => {
			if (this.subscribed > 0) {
				this.socketService.emit('feedstatus:subscribe');
			}
		});
	}

	private payloadRouterFn = (payload: any) => {
		if (this.subscribed > 0) {
			let message = new Message();
			message.setFromModel(payload.wrappedPayload.p.message);
			this.messageReceived.emit(message);
		}
	}

}
