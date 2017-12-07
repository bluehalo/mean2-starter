import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap';

import { CoreComponent } from './core.component';
import { ConfigService } from './config.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { Team } from '../teams/teams.class';
import { TeamsService } from '../teams/teams.service';
import { FeedbackModalComponent } from './feedback/feedback.component';

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
		private modalService: BsModalService
	) {
		super(authService, configService);
	}

	ngOnInit() {
		super.ngOnInit();

		// Subscribe to user initialization observable and load teams when done
		this.authService.initializing$.subscribe(
			(isInitializing: boolean) => {
				if (!isInitializing && this.user.isActive()) {
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

	showFeedbackModal() {
		this.modalService.show(FeedbackModalComponent, { ignoreBackdropClick: true, class: 'modal-lg' });
	}
}
