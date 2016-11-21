import { Component } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { Team } from '../teams.class';
import { TeamsService } from '../teams.service';
import { Owner } from './owner.class';
import { Tag } from './tags.class';
import { TagsService } from './tags.service';
import { AuthenticationService } from '../../admin/authentication/authentication.service';

@Component({
	selector: 'manage-tag',
	templateUrl: './manage-tag.component.html'
})
export class ManageTagComponent {

	private team: Team;

	private owner: Owner;

	private mode: string;

	private modeDisplay: string;

	private tag: Tag;

	private error: string = null;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthenticationService,
		private teamsService: TeamsService,
		private tagsService: TagsService
	) {
	}

	ngOnInit() {
		this.tag = new Tag();

		this.route.params.subscribe((params: Params) => {
			this.mode = params[`mode`];
			this.modeDisplay = this.mode.substr(0, 1).toUpperCase() + this.mode.substr(1);

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
							this.tag.owner = this.owner.id;
						}
					});
			}
		});
	}


	private save() {
		let result: Observable<Response> = this.mode === 'create' ? this.create() : this.update();
		result.subscribe(
			() => this.router.navigate(['/team/:id', {id: this.team._id}]),
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
