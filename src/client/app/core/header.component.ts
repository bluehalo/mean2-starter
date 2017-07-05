import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { CoreComponent } from './core.component';
import { ConfigService } from './config.service';
import { AuthenticationService } from 'app/admin/authentication/authentication.service';
import { Team } from 'app/teams/teams.class';
import { TeamsService } from 'app/teams/teams.service';

/**
 * Primary header component wrapping the whole page
 */
@Component({
	selector: 'core-header',
	templateUrl: './header.component.html'
})
export class HeaderComponent extends CoreComponent {

	teams: Team[] = [];
	private currentRoute: string = '';

	constructor(
		protected router: Router,
		authService: AuthenticationService,
		configService: ConfigService,
		protected teamsService: TeamsService,
	) {
		super(authService, configService);
	}

	ngOnInit() {
		super.ngOnInit();

		// Subscribe to user initialization observable and load teams when done
		this.authService.initializing$.subscribe(
			(isInitializing: boolean) => {
				if (!isInitializing && this.user.isAuthenticated()) {
					this.teamsService.selectionList().subscribe(
						(result: any) => {
							if (null != result && null != result.elements && result.elements.length > 0) {
								this.teams = result.elements.map((e: any) => new Team(e._id, e.name));
							}
							else {
								this.teams = [];
							}
						});
				}
			});

		this.router.events.subscribe(
			(event: any) => {
				if (event instanceof NavigationEnd) {
					this.currentRoute = event.url;
				}
			});
	}
}
