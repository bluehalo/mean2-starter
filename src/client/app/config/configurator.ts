import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ClientConfiguration {
	public static initializing$: BehaviorSubject<boolean>
		= <BehaviorSubject<boolean>> new BehaviorSubject(false);

	public static config: any = {
		providers: {
		},

		urlHandlers: []
	};

	public static applyConfig(overrides: any) {
		ClientConfiguration.config = Object.assign({}, ClientConfiguration.config, overrides);
	}

	public static completeInitialization(): void {
		ClientConfiguration.initializing$.next(true);
	}
}

