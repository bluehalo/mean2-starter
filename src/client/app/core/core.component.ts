import { NavigationEnd, Router, RouterEvent } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { ConfigService } from './config.service';
import { User } from '../admin/user.class';
import { AuthenticationService } from '../admin/authentication/authentication.service';

export class CoreComponent {

	user: User;

	banner: any;

	copyright: any;

	pki: boolean;

	collapsed: boolean = true;

	protected config: any;

	protected currentRoute: string = '';

	protected routeEventsSubscription: Subscription;

	constructor(
		protected router: Router,
		protected authService: AuthenticationService,
		protected configService: ConfigService
	) {}

	ngOnInit() {
		this.user = this.authService.getCurrentUser();

		this.routeEventsSubscription = this.router.events
			.filter((event: RouterEvent) => event instanceof NavigationEnd)
			.subscribe((event: RouterEvent) => this.currentRoute = event.url);

		this.configService.getConfig().first().subscribe( (config: any) =>  {
			this.config = config;
			this.banner = config.banner;
			this.banner.css = `banner-${config.banner.code}`;
			this.banner.css = this.banner.css.toLowerCase();
			this.copyright = config.copyright;
			this.pki = config.auth === 'proxy-pki';
		});
	}

	ngOnDestroy() {
		this.routeEventsSubscription.unsubscribe();
	}
}
