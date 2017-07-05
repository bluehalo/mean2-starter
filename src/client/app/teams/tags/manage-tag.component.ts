import { Component } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';

import { Team } from '../teams.class';
import { TeamsService } from '../teams.service';
import { Owner } from 'app/resources/owner.class';
import { Tag } from './tags.class';
import { TagsService } from './tags.service';

@Component({
	selector: 'manage-tag',
	templateUrl: './manage-tag.component.html'
})
export class ManageTagComponent {

	team: Team;
	owner: Owner;
	mode: string;
	modeDisplay: string;
	tag: Tag;
	error: string = null;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private teamsService: TeamsService,
		private tagsService: TagsService
	) {
	}

	ngOnInit() {
		this.tag = new Tag();

		this.route.params.subscribe((params: Params) => {
			this.mode = params[`mode`];
			this.modeDisplay = _.capitalize(this.mode);

			let tagId = params[`id`];
			let teamId = params[`teamId`];

			// Initialize tag if appropriate
			if (tagId) {
				this.tagsService.getTag(tagId)
					.subscribe((result: any) => {
						if (result) {
							this.tag = result;
							this.team = new Team(result.owner);
						}
					});
			}

			if (teamId) {
				this.teamsService.get(teamId)
					.subscribe((result: any) => {
						if (result) {
							this.team = result;
							this.owner = new Owner('team', result._id, result.name);
							this.tag.owner = this.owner._id;
						}
					});
			}
		});
	}


	save() {
		let result: Observable<Response> = this.mode === 'create' ? this.create() : this.update();
		result.subscribe(
			() => {
				this.router.navigate(['/team', this.team._id]);
			},
			(response: Response) => {
				if (response.status >= 400 && response.status < 500) {
					this.error = response.json().message;
				}
			});
	}

	private create(): Observable<Response> {
		return this.tagsService.createTag(this.tag);
	}

	private update(): Observable<Response> {
		return this.tagsService.updateTag(this.tag);
	}

}
