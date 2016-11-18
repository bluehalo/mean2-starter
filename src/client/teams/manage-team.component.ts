import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Response } from "@angular/http";

import { Observable } from "rxjs/Observable";

import { Team } from './teams.class';
import { TeamsService } from './teams.service';
import { AlertService } from '../shared/alert.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { ConfigService } from '../core/config.service';

@Component({
	selector: 'manage-team',
	templateUrl: './manage-team.component.html'
//	directives: [AlertComponent, AddRemoveList, BUTTON_DIRECTIVES, ROUTER_DIRECTIVES],
})
export class ManageTeamComponent {

	private team: Team;

	private teamId: string;

	private mode: string;

	private modeDisplay: string;

	private showExternalTeams: boolean = false;

	private error: string = null;

	private subtitle: string;

	private okButtonText: string;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private configService: ConfigService,
		private teamsService: TeamsService,
		private alertService: AlertService,
		private authService: AuthenticationService
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

			this.modeDisplay = this.mode.substr(0, 1).toUpperCase() + this.mode.substr(1);
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

	private updateExternalTeams(event: any) {
		if (event.hasOwnProperty('items')) {
			this.team.requiresExternalTeams = event.items;
		}
	}

	private save() {
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
