import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { CoreComponent } from './core.component';
import { ConfigService } from './config.service';
import { AuthenticationService } from 'app/admin/authentication/authentication.service';

/**
 * Primary footer component wrapping the whole page
 */
@Component({
	selector: 'core-footer',
	templateUrl: './footer.component.html'
})

export class FooterComponent extends CoreComponent {
	private currentRoute: string = '';

	constructor(
		auth: AuthenticationService,
		configService: ConfigService,
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
