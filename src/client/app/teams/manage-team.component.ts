import { Location } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Team } from './teams.class';
import { TeamsService } from './teams.service';
import { AlertService } from '../shared/alert.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { ConfigService } from '../core/config.service';

@Component({
	selector: 'manage-team',
	templateUrl: './manage-team.component.html'
})
export class ManageTeamComponent implements OnDestroy {

	team: Team;

	mode: string;

	modeDisplay: string;

	subtitle: string;

	okButtonText: string;

	showExternalTeams: boolean = false;

	error: string = null;

	teamId: string;

	private routeParamSubscription: Subscription;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private location: Location,
		private configService: ConfigService,
		private teamsService: TeamsService,
		private authService: AuthenticationService,
		public alertService: AlertService
	) {}

	ngOnInit() {
		this.alertService.clearAllAlerts();

		this.configService
			.getConfig()
			.first()
			.subscribe((config: any) => {
				// Need to show external groups when in proxy-pki mode
				if (config.auth === 'proxy-pki') {
					this.showExternalTeams = this.authService.getCurrentUser().isAdmin();
				}
			});

		this.routeParamSubscription = this.route.params.subscribe((params: Params) => {
			this.mode = params[`mode`];
			this.teamId = params[`id`];

			this.modeDisplay = _.capitalize(this.mode);
			this.subtitle = this.mode === 'create' ? 'Provide some basic metadata to create a new team' : 'Modify and save basic team metadata';
			this.okButtonText = this.mode === 'create' ? this.modeDisplay : 'Save';

			this.team = new Team();

			// Initialize team if appropriate
			if (this.teamId) {
				this.teamsService.get(this.teamId).filter((team: Team) => null != team).subscribe((team: Team) => this.team = team);
			}
		});
	}

	ngOnDestroy() {
		this.routeParamSubscription.unsubscribe();
	}

	back() {
		this.location.back();
	}

	updateExternalTeams(event: any) {
		if (event.hasOwnProperty('items')) {
			this.team.requiresExternalTeams = event.items;
		}
	}

	save() {
		let result: Observable<any> = this.mode === 'create' ? this.create() : this.update();
		result.switchMap(() => this.authService.reloadCurrentUser())
			.subscribe(() => {
				this.router.navigate(['/teams', {clearCachedFilter: true}]);
			}, (error: HttpErrorResponse) => {
				if (error.status >= 400 && error.status < 500) {
					this.error = error.error.message;
				}
			});
	}

	create(): Observable<any> {
		return this.teamsService.create(this.team);
	}

	update(): Observable<any> {
		return this.teamsService.update(this.team);
	}

}
