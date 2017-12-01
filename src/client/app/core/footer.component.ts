import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { CoreComponent } from './core.component';
import { ConfigService } from './config.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';

/**
 * Primary footer component wrapping the whole page
 */
@Component({
	selector: 'core-footer',
	templateUrl: 'footer.component.html'
})

export class FooterComponent extends CoreComponent {

	constructor(
		protected auth: AuthenticationService,
		protected configService: ConfigService,
		protected router: Router
	) {
		super(router, auth, configService);
	}
}
