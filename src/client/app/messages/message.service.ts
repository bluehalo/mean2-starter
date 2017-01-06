import { Injectable, EventEmitter } from '@angular/core';

import { Message } from './message.class';
import { PagingOptions } from '../shared/pager.component';
import { HttpOptions, AsyHttp } from '../shared/asy-http.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { UserStateService } from '../admin/authentication/user-state.service';
import { UserService } from '../admin/users.service';
import { SocketService } from '../core/socket.service';

@Injectable()
export class MessageService {

	public cache: any = {};

	public sort: any = {};

	public messageReceived: EventEmitter<Message> = new EventEmitter<Message>();

	private subscribed: number = 0;


	constructor(
		private asyHttp: AsyHttp,
		private socketService: SocketService,
		private userService: UserService,
		private userStateService: UserStateService,
		private authentication: AuthenticationService) {
	}

	public create(message: Message) {
		return this.asyHttp.post(new HttpOptions('admin/message', () => {
		}, message));
	}

	public get(id: string) {
		return this.asyHttp.get(new HttpOptions(`admin/message/${id}`, () => {
		}, {}));
	}

	/**
	 * Retrieves an array of a field's value for all messages in the system
	 */
	public getAll(query: any, field: any) {
		return this.asyHttp.post(new HttpOptions(`admin/message/getAll`, () => {
			},
			{query: query, field: field}));
	}

	public update(message: Message) {
		return this.asyHttp.post(new HttpOptions(`admin/message/${message._id}`, () => {
			},
			message));
	}

	public remove(id: string) {
		return this.asyHttp.delete(new HttpOptions(`admin/message/${id}`, () => {
		}, {}));
	}

	public search(query: any, search: any, paging: PagingOptions = new PagingOptions()) {
		return this.asyHttp.post(new HttpOptions(`messages?${this.asyHttp.urlEncode(paging.toObj())}`, () => {
			},
			{q: query, s: search}));
	}

	/**
	 * Websocket functionality for messages
	 */
	public subscribe() {
		if (this.subscribed === 0) {
			this.socketService.emit('message:subscribe');
		}
		this.subscribed++;
	}

	public unsubscribe() {
		this.subscribed--;

		if (this.subscribed === 0) {
			this.socketService.emit('message:unsubscribe');
		}
		else if (this.subscribed < 0) {
			this.subscribed = 0;
		}
	}

	public markAllRead() {
		this.userStateService.user.userModel.messagesViewed = new Date();
		this.userService.update(this.userStateService.user);
	}

	public initialize(): void {
		this.sort.map = {
			title: {label: 'Title', sort: 'title', dir: 'ASC'},
			created: {label: 'Created', sort: 'created', dir: 'DESC'}
		};
		this.sort.array = [this.sort.map.title];

		// Add event listeners to the websocket, across all statuses
		this.socketService.on('message:data', this.payloadRouterFn);

		this.socketService.on('disconnect', () => {

		});

		this.socketService.on('reconnect', () => {
			if (this.subscribed > 0) {
				this.socketService.emit('feedstatus:subscribe');
			}
		});
	}

	private payloadRouterFn: Function = (payload: any) => {
		if (this.subscribed > 0) {
			let message = new Message();
			message.setFromModel(payload.wrappedPayload.p.message);
			this.messageReceived.emit(message);
		}
	};

}
