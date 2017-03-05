import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { CoreComponent } from './core.component';
import { ConfigService } from './config.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { Team } from '../teams/teams.class';
import { TeamsService } from '../teams/teams.service';

/**
 * Primary header component wrapping the whole page
 */
@Component({
	selector: 'core-header',
	templateUrl: './header.component.html'
})
export class HeaderComponent extends CoreComponent {

	currentRoute: string = '';

	teams: Team[] = [];

	constructor(
		public router: Router,
		public authService: AuthenticationService,
		public configService: ConfigService,
		public teamsService: TeamsService,
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
