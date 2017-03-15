import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';

@Injectable()
export class NotificationStateService {

	private _notificationsReceived: BehaviorSubject<any> = new BehaviorSubject(null);
	private _notificationsCleared: BehaviorSubject<any> = new BehaviorSubject(null);

	constructor() {}

	get notificationsReceived$(): Observable<any> {
		return this._notificationsReceived.asObservable();
	}

	receiveNotifications(notification: any) {
		this._notificationsReceived.next(notification);
	}

	get notificationsCleared$(): Observable<any> {
		return this._notificationsCleared.asObservable();
	}

	clearNotifications(clear: boolean) {
		this._notificationsCleared.next(clear);
	}

}
