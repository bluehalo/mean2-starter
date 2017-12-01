import { Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Subscription } from 'rxjs/Subscription';

import { Team, TeamMember } from './teams.class';
import { TeamsService } from './teams.service';
import { AlertService } from '../shared/alert.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { StringUtils } from '../shared/string-utils.service';
import { ModalAction, ModalService } from '../shared/asy-modal.service';

@Component({
	selector: 'team-summary',
	templateUrl: 'team-summary.component.html'
})
export class TeamSummaryComponent implements OnDestroy {

	user: TeamMember;

	team: Team;

	teamId: string;

	defaultDescription: string = 'No Description.';

	private routeParamSubscription: Subscription;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private modalService: ModalService,
		private teamsService: TeamsService,
		public alertService: AlertService,
		private authService: AuthenticationService
	) {}

	ngOnInit() {
		this.user = this.teamsService.getCurrentUserAsTeamMember();

		this.team = new Team();

		this.routeParamSubscription = this.route.params.subscribe((params: Params) => {
			this.teamId = params[`id`];

			// Initialize team
			if (this.teamId) {
				this.teamsService.get(this.teamId).subscribe((team: Team) => {
					if (null != team) {
						this.team = team;
						if (StringUtils.isInvalid(this.team.description)) {
							this.team.description = this.defaultDescription;
						}
					}
					else {
						this.router.navigate(['resource/invalid', {type: 'team'}]);
					}
				}, () => {
					this.router.navigate(['resource/invalid', {type: 'team'}]);
				});
			}
		});
	}

	ngOnDestroy() {
		this.routeParamSubscription.unsubscribe();
	}

	saveEditable(val: any) {
		if (val.hasOwnProperty('name')) {
			this.team.name = val.name;
		}

		if (val.hasOwnProperty('description')) {
			this.team.description = val.description;
		}

		this.teamsService.update(this.team).subscribe((team: Team) => {
			if (null != team) {
				this.team = team;
				if (StringUtils.isInvalid(this.team.description)) {
					this.team.description = this.defaultDescription;
				}
			}
		}, (error: HttpErrorResponse) => this.alertService.addClientErrorAlert(error));
	}

	update() {
		this.router.navigate(['/team/edit', this.teamId]);
	}

	remove() {
		this.modalService
			.confirm('Delete team?', `Are you sure you want to delete the team: <strong>"${this.team.name}"</strong>?<br/>This action cannot be undone.`, 'Delete')
			.first()
			.filter((action: ModalAction) => action === ModalAction.OK)
			.switchMap(() => this.teamsService.delete(this.team._id))
			.switchMap(() => this.authService.reloadCurrentUser())
			.subscribe(() => {
				this.router.navigate(['/teams', {clearCachedFilter: true}]);
			}, (error: HttpErrorResponse) => this.alertService.addClientErrorAlert(error));
	}
}
