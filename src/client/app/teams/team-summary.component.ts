import { Component } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Team, TeamMember } from './teams.class';
import { TeamsService } from './teams.service';
import { AlertService } from '../shared/alert.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { StringUtils } from '../shared/string-utils.service';
import { ModalAction, ModalService } from '../shared/asy-modal.service';

@Component({
	selector: 'team-summary',
	templateUrl: './team-summary.component.html'
})
export class TeamSummaryComponent {

	user: TeamMember;

	team: Team;

	teamId: string;

	defaultDescription: string = 'No Description.';

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private modalService: ModalService,
		private teamsService: TeamsService,
		public alertService: AlertService,
		private authService: AuthenticationService
	) {
	}

	ngOnInit() {
		this.user = this.teamsService.getCurrentUserAsTeamMember();

		this.team = new Team();

		this.route.params.subscribe((params: Params) => {
			this.teamId = params[`id`];

			// Initialize team
			if (this.teamId) {
				this.teamsService.get(this.teamId)
					.subscribe(
						(result: any) => {
							if (null != result) {
								this.team = new Team(result._id, result.name, result.description, result.created, result.requiresExternalTeams);
								if (StringUtils.isInvalid(this.team.description)) {
									this.team.description = this.defaultDescription;
								}
							}
							else {
								this.router.navigate(['resource/invalid', {type: 'team'}]);
							}
						},
						() => {
							this.router.navigate(['resource/invalid', {type: 'team'}]);
						});
			}
		});
	}

	saveEditable(val: any) {
		if (val.hasOwnProperty('name')) {
			this.team.name = val.name;
		}

		if (val.hasOwnProperty('description')) {
			this.team.description = val.description;
		}

		this.teamsService.update(this.team)
			.subscribe(
				(result: any) => {
					if (null != result) {
						this.team = new Team(result._id, result.name, result.description, result.created, result.requiresExternalTeams);

						if (StringUtils.isInvalid(this.team.description)) {
							this.team.description = this.defaultDescription;
						}
					}
				},
				(response: Response) => {
					if (response.status >= 400 && response.status < 500) {
						this.alertService.addAlert(response.json().message);
					}
				});
	}

	update() {
		this.router.navigate(['/team/edit', this.teamId]);
	}

	remove() {
		this.modalService
			.confirm('Delete team?', `Are you sure you want to delete the team: <strong>"${this.team.name}"</strong>?<br/>This action cannot be undone.`, 'Delete')
			.first()
			.filter((action: ModalAction) => action === ModalAction.OK)
			.switchMap(() => {
				return this.teamsService.delete(this.team._id);
			})
			.switchMap(() => {
				return this.authService.reloadCurrentUser();
			})
			.subscribe(() => {
				this.router.navigate(['/teams', {clearCachedFilter: true}]);
			}, (response: Response) => {
				if (response.status >= 400 && response.status < 500) {
					this.alertService.addAlert(response.json().message);
				}
								});
	}
}
