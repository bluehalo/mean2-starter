import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { CoreComponent } from './core.component';
import { ConfigService } from './config.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';

/**
 * Primary header component wrapping the whole page
 */
@Component({
	selector: 'core-header',
	templateUrl: './header.component.html'
})
export class HeaderComponent extends CoreComponent {
	private currentRoute: string = '';

	constructor(
		protected auth: AuthenticationService,
		protected configService: ConfigService,
		protected router: Router
	) {
		super(auth, configService);
	}

	ngOnInit() {
		super.ngOnInit();

		this.router.events.subscribe( (event) => {
			if (event instanceof NavigationEnd) {
				this.currentRoute = event.url;
			}
		});
	}
}
