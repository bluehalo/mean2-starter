import { Injectable } from '@angular/core';

import { AsyHttp, HttpOptions } from '../shared/asy-http.service';

// Can be extended to support alternate notification types (e.g. alert)
type NotificationType = 'seed';

export class NotificationPreferences {
	constructor(
		public email: boolean
	) {}
}

@Injectable()
export class UserNotificationPreferencesService {
	constructor(
		private asyHttp: AsyHttp
	) {}

	public get(referenceId: string, type: NotificationType) {
		return this.asyHttp.get(new HttpOptions('users/me/preferences/notifications/' + type + '/' + referenceId, () => {}));
	}

	public save(referenceId: string, type: NotificationType, preferences: NotificationPreferences) {
		return this.asyHttp.post(new HttpOptions('users/me/preferences/notifications/' + type + '/' + referenceId, () => {}, preferences));
	}

}
