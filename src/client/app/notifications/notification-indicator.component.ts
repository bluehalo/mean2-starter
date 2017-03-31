import { Component, OnInit } from '@angular/core';
import { NotificationStateService } from './notification-state-service';
import { ConfigService } from 'app/core/config.service';

@Component({
	templateUrl: 'notification-indicator.component.html',
	selector: '[notification-indicator]'
})
export class NotificationIndicatorComponent implements OnInit {

	notificationsEnabled = false;

	newAlerts: boolean = false;

	unreadCount: number = 0;

	constructor(
		public notificationStateService: NotificationStateService,
		public configService: ConfigService
	) {}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe( (config: any) =>  {
				this.notificationsEnabled = config.dispatcher && (!config.dispatcher.hasOwnProperty('enabled') || config.dispatcher.enabled);
				if (this.notificationsEnabled) {
					// Initialize state service subscriptions
					this.notificationStateService.notificationsReceived$
						.subscribe((notifications: any[]) => {
							this.newAlerts = true;
							if (notifications && notifications.length > 0) {
								this.unreadCount += notifications.length;
							}
						});

					this.notificationStateService.notificationsCleared$
						.subscribe( () => {
							this.newAlerts = false;
							this.unreadCount = 0;
						});
				}

			});

	}

	public indicatorClicked() {
		if (this.unreadCount > 0) {
			this.notificationStateService.clearNotifications(true);
		}
	}

}
