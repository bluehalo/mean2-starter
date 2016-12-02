import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Response } from '@angular/http';

import * as _ from 'lodash';

import { AuthenticationService } from '../admin/authentication/authentication.service';
import { Owner } from './owner.class';
import { PagingOptions } from '../shared/pager.component';
import { Resource } from './resource.class';
import { Tag } from '../teams/tags/tags.class';
import { TagsService } from '../teams/tags/tags.service';
import { Team, TeamMember } from '../teams/teams.class';
import { TeamsService } from '../teams/teams.service';

@Component({
	selector: 'manage-resource-metadata',
	templateUrl: './manage-resource-metadata.component.html'
})
export class ManageResourceMetadataComponent {

	@Input() resource: Resource;

	@Input() mode: string;

	@Output() alertError = new EventEmitter();

	private ownerOptions: Owner[] = [];

	private tagOptions: Tag[] = [];

	constructor(
		private authService: AuthenticationService,
		private tagsService: TagsService,
		private teamsService: TeamsService
	) {
	}

	ngOnInit() {
		// Get current user info in order to access permissions
		let user = new TeamMember().setFromTeamMemberModel(null, this.authService.getCurrentUser().userModel);

		// Get owner options based on current user permissions
		this.teamsService.getTeamsCanManageResources(user)
			.subscribe(
				(teams: Team[]) => {
					this.ownerOptions = teams.map((team: Team) => new Owner('team', team._id, team.name));

					// Initialize resource owner to the matching option, or default to the first team in the list
					let idx = 0;
					if (this.mode === 'edit') {
						idx = Math.min(0, _.findIndex(this.ownerOptions, (opt: Owner) => { return this.resource.owner.type === opt.type && this.resource.owner._id === opt._id; }));
					}
					this.resource.owner = this.ownerOptions[idx];
					this.getTagOptions();
				},
				(response: Response) => {
					this.alertError.emit({err: response.json().message});
				});
	}

	private getTagOptions() {
		this.tagsService.searchTags({'owner': this.resource.owner._id}, null, new PagingOptions(0, 1000), {})
			.subscribe(
				(result: any) => {
					if (null != result && null != result.elements && result.elements.length > 0) {
						this.tagOptions = result.elements;
						this.resource.tags = this.tagOptions.filter((p: any) => {
							return (-1 !== _.findIndex(this.resource.tags, (o: any) => { return o._id === p._id; }));
						});
					}
					else {
						this.tagOptions = [];
					}
				},
				(response: Response) => {
					this.alertError.emit({err: response.json().message});
				});

	}

	private updateTags(event: any) {
		if (event.hasOwnProperty('items')) {
			this.resource.tags = event.items;
		}
	}
}
