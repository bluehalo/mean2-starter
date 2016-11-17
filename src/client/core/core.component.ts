import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { ConfigService } from './config.service';
import { User } from '../admin/user.class';
import { AuthenticationService } from '../admin/authentication.service';

export class CoreComponent {
	protected config: any;

	protected banner: any;
	protected copyright: string;
	protected pki: boolean;
	protected collapsed: boolean = false;

	protected user: User;

	constructor(
		protected auth: AuthenticationService,
		protected configService: ConfigService
	) {}

	ngOnInit() {
		this.user = this.auth.getCurrentUser();

		this.configService.getConfig()
			.subscribe( (config: any) =>  {
				this.config = config;
				this.banner = config.banner;
				this.banner.css = `banner-${config.banner.code}`;
				this.banner.css = this.banner.css.toLowerCase();
				this.copyright = config.copyright;
				this.pki = config.auth === 'proxy-pki';
			} );
	}
}

/**
 * Primary header component wrapping the whole page
 */
@Component({
	selector: 'core-header',
	templateUrl: '../views/header.client.view.html'
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

/**
 * Primary footer component wrapping the whole page
 */
@Component({
	selector: 'core-footer',
	templateUrl: '../views/footer.client.view.html'
})

export class FooterComponent extends CoreComponent {
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
