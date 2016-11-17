import { Component } from '@angular/core';

// import {Component, forwardRef, Inject} from '@angular/core';
// import {Response} from "@angular/http";
// import {ROUTER_DIRECTIVES, Router, RouteParams} from "@angular/router-deprecated";
// import {AlertComponent, BUTTON_DIRECTIVES, TYPEAHEAD_DIRECTIVES} from "ng2-bootstrap/ng2-bootstrap";
// import {Observable} from "rxjs/Observable";
// import {Team, TeamsService} from "../services/teams.client.service";
// import {ConfigService} from "../../../core/client/services/config.client.service";
// import {AuthenticationService} from "../../../users/client/services/authentication.client.service";
// import {AddRemoveList} from "../../../util/client/components/add-remove-list.client.component";
// import {AlertService} from "../../../util/client/services/alert.client.service";
// import {AsyRouteMappings} from "../../../util/client/util/AsyRouteMappings.client.class";

@Component({
	selector: 'manage-team',
	templateUrl: '/app/teams/views/manage-team.client.view.html'
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
		private routeParams: RouteParams,
		private configService: ConfigService,
		private teamsService: TeamsService,
		public alertService: AlertService,
		public auth: AuthenticationService,
		@Inject(forwardRef(() => AsyRouteMappings)) protected asyRoutes
	) {}

	ngOnInit() {
		this.alertService.clearAllAlerts();

		this.configService.getConfig()
			.subscribe( (config: any) => {
				// Need to show external groups when in proxy-pki mode
				if (config.auth === 'proxy-pki') {
					this.showExternalTeams = this.auth.getCurrentUser().isAdmin();
				}
			});

		// Get route params
		this.mode = this.routeParams.get('mode');
		this.teamId = this.routeParams.get('id');

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
				this.auth.reloadCurrentUser().subscribe(() => {
					this.router.navigate([this.asyRoutes.getPath('Teams'), {clearCachedFilter: true}])
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
