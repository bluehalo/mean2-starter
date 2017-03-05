import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Response } from '@angular/http';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';

import { Team } from './teams.class';
import { TeamsService } from './teams.service';
import { AlertService } from '../shared/alert.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { ConfigService } from '../core/config.service';

@Component({
	selector: 'manage-team',
	templateUrl: './manage-team.component.html'
})
export class ManageTeamComponent {

	team: Team;

	teamId: string;

	mode: string;

	modeDisplay: string;

	showExternalTeams: boolean = false;

	error: string = null;

	subtitle: string;

	okButtonText: string;

	constructor(
		public router: Router,
		public route: ActivatedRoute,
		public location: Location,
		public configService: ConfigService,
		public teamsService: TeamsService,
		public alertService: AlertService,
		public authService: AuthenticationService
	) {
	}

	ngOnInit() {
		this.alertService.clearAllAlerts();

		this.configService.getConfig()
			.subscribe((config: any) => {
				// Need to show external groups when in proxy-pki mode
				if (config.auth === 'proxy-pki') {
					this.showExternalTeams = this.authService.getCurrentUser().isAdmin();
				}
			});

		this.route.params.subscribe((params: Params) => {
			this.mode = params[`mode`];
			this.teamId = params[`id`];

			this.modeDisplay = _.capitalize(this.mode);
			this.subtitle = this.mode === 'create' ? 'Provide some basic metadata to create a new team' : 'Modify and save basic team metadata';
			this.okButtonText = this.mode === 'create' ? this.modeDisplay : 'Save';

			this.team = new Team();

			// Initialize team if appropriate
			if (this.teamId) {
				this.teamsService.get(this.teamId)
					.subscribe((result: any) => {
						if (result) {
							this.team = new Team(result._id, result.name, result.description, result.created, result.requiresExternalTeams);
						}
					});
			}

		});
	}

	updateExternalTeams(event: any) {
		if (event.hasOwnProperty('items')) {
			this.team.requiresExternalTeams = event.items;
		}
	}

	save() {
		let result: Observable<Response> = this.mode === 'create' ? this.create() : this.update();
		result.subscribe(
			() => {
				this.authService.reloadCurrentUser().subscribe(() => {
					this.router.navigate(['/teams', {clearCachedFilter: true}]);
				});
			},
			(response: Response) => {
				if (response.status >= 400 && response.status < 500) {
					this.error = response.json().message;
				}
			});
	}

	create(): Observable<Response> {
		return this.teamsService.create(this.team);
	}

	update(): Observable<Response> {
		return this.teamsService.update(this.team);
	}

	back() {
		this.location.back();
	}
}
