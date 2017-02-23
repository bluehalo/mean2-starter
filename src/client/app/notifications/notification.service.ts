import { Injectable, EventEmitter } from '@angular/core';
import { AsyHttp, HttpOptions } from '../shared/asy-http.service';
import { SocketService } from '../core/socket.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { UserStateService } from '../admin/authentication/user-state.service';
import { Notification } from './notification.class';
import { UserService } from '../admin/users.service';
import { PagingOptions } from '../shared/pager.component';

@Injectable()
export class NotificationService {

	public cache: any = {};

	public sort: any = {};

	public notificationReceived: EventEmitter<Notification> = new EventEmitter<Notification>();

	private subscribed: number = 0;


	constructor(
		private asyHttp: AsyHttp,
		private socketService: SocketService,
		private userService: UserService,
		private userStateService: UserStateService,
		private authentication: AuthenticationService) {
	}

	public search(query: any, search: any, paging: PagingOptions = new PagingOptions()) {
		return this.asyHttp.post(new HttpOptions(`alert-notifications?${this.asyHttp.urlEncode(paging.toObj())}`, () => {
			},
			{q: query, s: search}));
	}

	/**
	 * Websocket functionality for notifications
	 */
	public subscribe() {
		if (this.subscribed === 0) {
			this.socketService.emit('notification:subscribe');
		}
		this.subscribed++;
	}

	public unsubscribe() {
		this.subscribed--;

		if (this.subscribed === 0) {
			this.socketService.emit('notification:unsubscribe');
		}
		else if (this.subscribed < 0) {
			this.subscribed = 0;
		}
	}

	public markAllRead() {
		this.userStateService.user.userModel.notificationsViewed = new Date();
		this.userService.update(this.userStateService.user);
	}

	public initialize(): void {
		this.sort.map = {
			title: {label: 'Title', sort: 'title', dir: 'ASC'},
			created: {label: 'Created', sort: 'created', dir: 'DESC'}
		};
		this.sort.array = [this.sort.map.title];

		// Add event listeners to the websocket, across all statuses
		this.socketService.on('notification:data', this.payloadRouterFn);

		this.socketService.on('disconnect', () => {

		});

		this.socketService.on('reconnect', () => {
			if (this.subscribed > 0) {
				this.socketService.emit('notification:subscribe');
			}
		});

		// Register for new notifications from the websocket
		this.subscribe();
	}

	private payloadRouterFn: Function = (payload: any) => {
		if (this.subscribed > 0) {
			let notification = new Notification();
			notification.setFromModel(payload.value);
			this.notificationReceived.emit(notification);
		}
	};

}
