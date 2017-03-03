import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { UserStateService } from '../admin/authentication/user-state.service';
import { Notification } from './notification.class';
import { NotificationService } from './notification.service';
import { NotificationStateService } from './notification-state-service';

@Injectable()
export class NotificationHandlerService {
	public subscribed: boolean = false;

	constructor(
		public userStateService: UserStateService,
		public authentication: AuthenticationService,
		public notificationService: NotificationService,
		public notificationStateService: NotificationStateService) {
	}

	public initialize() {

		// Subscribe to state changes
		this.notificationStateService.notificationsCleared$
			.subscribe((clear) => {
				if (clear) {
					this.notificationService.markAllRead();
				}
			});

		// Subscribe to the user's authentication observable.  When the user signs in,
		// init the websocket and do an initial query for existing notifications
		this.authentication.initializing$
			.subscribe(() => {
				if (this.userStateService.user.isActive()) {
					if (this.subscribed) {
						return;
					}
					this.subscribed = true;

					// Initialize the websocket
					this.notificationService.initialize();
					this.notificationService.notificationReceived
						.subscribe((notification: any) => {
							this.notificationStateService.receiveNotifications([notification]);
						});

					// Check for existing unread notifications
					let notificationsViewed = this.userStateService.user.userModel.notificationsViewed;
					let query = {};
					if (undefined !== notificationsViewed) {
						query = {'created': {'$gte': this.userStateService.user.userModel.notificationsViewed}};
					}
					this.notificationService.search(query, null)
						.subscribe((notifications) => {
							if (notifications.totalSize === 0) {
								return;
							}

							if (notifications.totalSize > 1) {
								this.notificationStateService.receiveNotifications(notifications.elements);
							}
						});

				}
			});
	}

}
