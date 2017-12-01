import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Team } from '../teams.class';
import { TeamsService } from '../teams.service';
import { Owner } from '../../resources/owner.class';
import { Tag } from './tags.class';
import { TagsService } from './tags.service';

@Component({
	selector: 'manage-tag',
	templateUrl: 'manage-tag.component.html'
})
export class ManageTagComponent {

	team: Team;

	owner: Owner;

	mode: string;

	modeDisplay: string;

	tag: Tag;

	error: string = null;

	private routeParamSubscription: Subscription;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private teamsService: TeamsService,
		private tagsService: TagsService
	) {}

	ngOnInit() {
		this.tag = new Tag();

		this.routeParamSubscription = this.route.params.subscribe((params: Params) => {
			this.mode = params[`mode`];
			this.modeDisplay = _.capitalize(this.mode);

			let tagId = params[`id`];
			let teamId = params[`teamId`];

			// Initialize tag if appropriate
			if (tagId) {
				this.tagsService.getTag(tagId).subscribe((result: any) => {
					if (result) {
						this.tag = result;
						this.team = new Team(result.owner);
					}
				});
			}

			if (teamId) {
				this.teamsService.get(teamId).subscribe((team: Team) => {
					if (team) {
						this.team = team;
						this.owner = new Owner('team', team._id, team.name);
						this.tag.owner = this.owner._id;
					}
				});
			}
		});
	}

	ngOnDestroy() {
		this.routeParamSubscription.unsubscribe();
	}

	save() {
		let result: Observable<any> = this.mode === 'create' ? this.create() : this.update();
		result.subscribe(
		() => this.router.navigate(['/team', this.team._id]),
		(error: HttpErrorResponse) => {
				if (error.status >= 400 && error.status < 500) {
					this.error = error.error.message;
				}
			});
	}

	private create(): Observable<any> {
		return this.tagsService.createTag(this.tag);
	}

	private update(): Observable<any> {
		return this.tagsService.updateTag(this.tag);
	}

}
