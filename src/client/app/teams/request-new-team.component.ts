import { Component } from '@angular/core';
import { Response } from '@angular/http';

import { BsModalRef } from 'ngx-bootstrap';

import { TeamMember } from './teams.class';
import { TeamsService } from './teams.service';
import { StringUtils } from '../shared/string-utils.service';

@Component({
	templateUrl: 'request-new-team.component.html'
})
export class RequestNewTeamModalComponent {

	user: TeamMember;

	error: string;

	success: string;

	organization: string;

	aoi: string;

	description: string;

	submitting: boolean = false;

	constructor(
		private teamsService: TeamsService,
		public modalRef: BsModalRef
	) {
		this.user = this.teamsService.getCurrentUserAsTeamMember();
	}

	submit() {
		if (this.validateInput()) {
			this.error = null;
			this.submitting = true;
			this.teamsService.requestNewTeam(this.user, this.organization, this.aoi, this.description).subscribe(() => {
				this.success = 'Request successfully submitted!';
				setTimeout(() => this.modalRef.hide(), 1500);
			}, (response: Response) => {
				this.submitting = false;
				this.error = response.json().message;
			});
		}
		else {
			this.error = 'Must fill out all fields.';
		}
	}

	private validateInput(): boolean {
		return StringUtils.isNonEmptyString(this.organization) && StringUtils.isNonEmptyString(this.aoi) && StringUtils.isNonEmptyString(this.description);
	}
}
