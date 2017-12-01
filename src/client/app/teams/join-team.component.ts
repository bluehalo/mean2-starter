import { Component } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap';

import { TeamMember } from './teams.class';
import { ITeamResults, TeamsService } from './teams.service';
import { SortDirection } from '../shared/result-utils.class';
import { PagingOptions } from '../shared/pager.component';
import { AlertService } from '../shared/alert.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { RequestNewTeamModalComponent } from './request-new-team.component';

@Component({
	templateUrl: 'join-team.component.html'
})
export class JoinTeamComponent {

	user: TeamMember;

	teams: any[] = [];

	pagingOptions: PagingOptions;

	constructor(
		private modalService: BsModalService,
		private teamsService: TeamsService,
		private authService: AuthenticationService,
		public alertService: AlertService
	) {
		this.alertService.clearAllAlerts();
		this.user = this.teamsService.getCurrentUserAsTeamMember();

		this.pagingOptions = new PagingOptions();
		this.pagingOptions.sortField = 'name';
		this.pagingOptions.sortDir = SortDirection.asc;

		this.loadTeams();
	}

	goToPage(event: any) {
		this.pagingOptions.update(event.pageNumber, event.pageSize);
		this.loadTeams();
	}

	applySearch() {
		this.pagingOptions.setPageNumber(0);
		this.loadTeams();
	}

	requestAccess(team: any) {
		team.submitting = true;
		this.teamsService.requestAccessToTeam(team._id, this.user.userModel)
			.switchMap(() => this.authService.reloadCurrentUser())
			.subscribe(() => {
				this.user = this.teamsService.getCurrentUserAsTeamMember();
				this.loadTeams();
			}, (err) => {
				this.alertService.addAlertResponse(err);
			});
	}

	requestNewTeam() {
		this.modalService.show(RequestNewTeamModalComponent, { ignoreBackdropClick: true, class: 'modal-lg' });
	}

	private loadTeams() {
		this.teamsService.getTeams(this.pagingOptions).subscribe((result: ITeamResults) => {
			this.teams = result.elements;
			this.teams.forEach((team: any) => {
				const index = this.user.userModel.teams.findIndex((userTeam: any) => userTeam._id === team._id);
				if (index !== -1) {
					team.containsUser = true;
					team.requestedAccess = this.user.userModel.teams[index].role === 'requester';
				}
			});

			if (this.teams.length > 0) {
				this.pagingOptions.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
			}
			else {
				this.pagingOptions.reset();
			}
		});
	}
}
