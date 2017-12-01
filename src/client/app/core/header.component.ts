import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap';

import { CoreComponent } from './core.component';
import { ConfigService } from './config.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { Team } from '../teams/teams.class';
import { TeamsService } from '../teams/teams.service';
import { FeedbackModalComponent } from './feedback/feedback.component';
import { IPagingResults } from '../shared/pager.component';

/**
 * Primary header component wrapping the whole page
 */
@Component({
	selector: 'core-header',
	templateUrl: 'header.component.html'
})
export class HeaderComponent extends CoreComponent {

	teams: Team[] = [];

	constructor(
		protected router: Router,
		protected authService: AuthenticationService,
		protected configService: ConfigService,
		private teamsService: TeamsService,
		private modalService: BsModalService
	) {
		super(router, authService, configService);
	}

	ngOnInit() {
		super.ngOnInit();

		// Subscribe to user initialization observable and load teams when done
		this.authService.initializing$
			.filter((isInitializing: boolean) => !isInitializing && this.user.isAuthenticated())
			.switchMap(() => this.teamsService.selectionList())
			.subscribe((result: IPagingResults) => this.teams = result.elements);
	}

	showFeedbackModal() {
		this.modalService.show(FeedbackModalComponent, { ignoreBackdropClick: true, class: 'modal-lg' });
	}
}
