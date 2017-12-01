import { Injectable, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { Message } from './message.class';
import { IPagingResults, NULL_PAGING_RESULTS, PagingOptions } from '../shared/pager.component';
import { HttpOptions, AsyHttp } from '../shared/asy-http.service';
import { UserStateService } from '../admin/authentication/user-state.service';
import { UserService } from '../admin/users.service';
import { SocketService } from '../core/socket.service';
import { AlertService } from '../shared/alert.service';

@Injectable()
export class MessageService {

	cache: any = {};

	sort: any = {};

	messageReceived: EventEmitter<Message> = new EventEmitter<Message>();

	private subscribed: number = 0;

	constructor(
		private asyHttp: AsyHttp,
		private alertService: AlertService,
		private socketService: SocketService,
		private userService: UserService,
		private userStateService: UserStateService) {
	}

	create(message: Message): Observable<any> {
		return this.asyHttp.post(new HttpOptions('admin/message', () => {}, message));
	}

	get(id: string): Observable<Message>  {
		return this.asyHttp.get(new HttpOptions(`admin/message/${id}`, () => {}, {}))
			.map((result: any) => new Message().setFromModel(result));
	}

	/**
	 * Retrieves an array of a field's value for all messages in the system
	 */
	getAll(query: any, field: any): Observable<any>  {
		return this.asyHttp.post(new HttpOptions(`admin/message/getAll`, () => {}, { query: query, field: field }));
	}

	update(message: Message): Observable<any>  {
		return this.asyHttp.post(new HttpOptions(`admin/message/${message._id}`, () => {}, message));
	}

	remove(id: string): Observable<any>  {
		return this.asyHttp.delete(new HttpOptions(`admin/message/${id}`, () => {}, {}));
	}

	search(query: any, search: any, paging: PagingOptions = new PagingOptions()): Observable<IPagingResults> {
		return this.asyHttp.post(new HttpOptions(`messages?${this.asyHttp.urlEncode(paging.toObj())}`, () => {}, { q: query, s: search }))
			.catch((error: HttpErrorResponse) => {
				this.alertService.addAlert(error.error.message);
				return Observable.of(NULL_PAGING_RESULTS);
			});
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
