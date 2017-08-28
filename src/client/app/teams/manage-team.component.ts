import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Response } from '@angular/http';

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
export class ManageTeamComponent {

	team: Team;
	mode: string;
	modeDisplay: string;
	subtitle: string;
	okButtonText: string;

	showExternalTeams: boolean = false;
	error: string = null;

	private teamId: string;

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
			this.mode = _.get(this.route, 'data.value.mode', 'create');
			this.teamId = params[`id`];

			this.modeDisplay = _.capitalize(this.mode);
			this.subtitle = this.mode === 'create' ? 'Provide some basic metadata to create a new team' : 'Modify and save basic team metadata';
			this.okButtonText = this.mode === 'create' ? this.modeDisplay : 'Save';

			this.team = new Team();

			// Initialize team if appropriate
			if (this.teamId) {
				this.teamsService.get(this.teamId).subscribe((result: any) => {
					if (result) {
						this.team = new Team(result._id, result.name, result.description, result.created, result.requiresExternalTeams);
					}
				});
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

	private create(): Observable<Response> {
		return this.teamsService.create(this.team);
	}

	private update(): Observable<Response> {
		return this.teamsService.update(this.team);
	}

}
