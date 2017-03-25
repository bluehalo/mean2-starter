import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Response } from '@angular/http';

import * as _ from 'lodash';

import { Owner } from './owner.class';
import { PagingOptions } from '../shared/pager.component';
import { Resource } from './resource.class';
import { Tag } from '../teams/tags/tags.class';
import { TagsService } from '../teams/tags/tags.service';
import { Team } from '../teams/teams.class';
import { TeamsService } from '../teams/teams.service';

@Component({
	selector: 'manage-resource-metadata',
	templateUrl: './manage-resource-metadata.component.html'
})
export class ManageResourceMetadataComponent {

	@Input() resource: Resource;

	@Input() readOnly = false;

	@Input() mode: string;

	@Input() hideTitle: boolean = false;

	@Input() hideDescription: boolean = false;

	@Output() alertError = new EventEmitter();

	@Output() resourceChange = new EventEmitter();

	ownerOptions: Owner[] = [];

	tagOptions: Tag[] = [];

	filteredTagOptions: Tag[] = [];

	constructor(
		public tagsService: TagsService,
		public teamsService: TeamsService
	) {
	}

	ngOnInit() {
		// Get current user info in order to access permissions
		let user = this.teamsService.getCurrentUserAsTeamMember();

		// Get owner options based on current user permissions
		this.teamsService.getTeamsCanManageResources(user)
			.subscribe(
				(teams: Team[]) => {
					this.ownerOptions = teams.map((team: Team) => new Owner('team', team._id, team.name));

					// Default to the first team in the list
					if (this.mode === 'create') {
						this.resource.owner = this.ownerOptions[0];
						this.resourceChange.emit(this.resource);
					}

					this.getTagOptions();
				},
				(response: Response) => {
					this.alertError.emit({err: response.json().message});
				});
	}

	processTags() {
		this.filteredTagOptions = [];

		this.tagOptions.forEach((t: Tag) => {
			if (-1 === _.findIndex(this.resource.tags, (r: any) => r._id === t._id)) {
				this.filteredTagOptions.push(t);
			}
		});
	}

	getTagOptions() {
		this.tagsService.searchTags({'owner': this.resource.owner._id}, null, new PagingOptions(0, 1000), {})
			.subscribe(
				(result: any) => {
					if (null != result && null != result.elements && result.elements.length > 0) {
						this.tagOptions = result.elements;
						this.resource.tags = this.tagOptions.filter((p: any) => (-1 !== _.findIndex(this.resource.tags, (o: any) => o._id === p._id)));
						this.processTags();
					}
					else {
						this.tagOptions = [];
					}
				},
				(response: Response) => {
					this.alertError.emit({err: response.json().message});
				});
	}

	haveDescription() {
		return _.isString(this.resource.description) && this.resource.description.trim().length > 0;
	}

	updateTags(event: any) {
		if (event.hasOwnProperty('items')) {
			this.resource.tags = event.items;
			this.processTags();
			this.resourceChange.emit(this.resource);
		}
	}

	updateField(field: string, value: any) {
		this.resource[field] = value;
		this.resourceChange.emit(this.resource);

		if (field === 'owner') {
			this.getTagOptions();
		}
	}
}
