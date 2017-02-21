import { Component, Output, EventEmitter, Input } from '@angular/core';

import * as _ from 'lodash';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../admin/authentication/authentication.service';
import { ObservableUtils } from '../shared/observable-utils.class';
import { TagsService } from './tags/tags.service';
import { TeamsService } from './teams.service';
import { TeamMember, Team } from './teams.class';
import { Tag } from './tags/tags.class';
import { PagingOptions } from '../shared/pager.component';

@Component({
	selector: 'select-teams',
	templateUrl: './select-teams.component.html'
})
export class SelectTeamsComponent {

	@Input() showTags: boolean = true;

	@Output() alertError = new EventEmitter();

	@Output() setSelection = new EventEmitter();

	user: TeamMember;

	// Tag filter variables
	allTagOption: Tag = new Tag('All', 'All Tags');

	selectedTag: Tag = this.allTagOption;

	preselectedTag: Tag;

	tagOptions: Tag[] = [];

	// Team filter variables
	allTeamOption: Team = new Team('All', 'All Teams');

	selectedTeam: Team = this.allTeamOption;

	preselectedTeam: Team;

	teamOptions: Team[] = [];

	constructor(
		public authService: AuthenticationService,
		public tagsService: TagsService,
		public teamsService: TeamsService
	) {
	}

	ngOnInit() {
		// Get current user info in order to access permissions
		this.user = this.teamsService.getCurrentUserAsTeamMember();

		ObservableUtils.wrapArray([
			this.initializeTeams(), this.initializeTags(), this.handleSelection()
		]).subscribe(() => {}, (err: any) => { this.alertError.emit(err); });
	}

	/**
	 * Allows parent components to set pre-selected teams and tags
	 */
	setSelectionInput(tag: Tag, team: Team) {
		this.preselectedTeam = team;
		this.preselectedTag = tag;
	}

	sortByName(a: any, b: any) {
		let aname = a.name.toUpperCase();
		let bname = b.name.toUpperCase();

		if (aname === bname) {
			return 0;
		}

		return (aname < bname) ? -1 : 1;
	}

	/**
	 * Populates the team option dropdown depending on the user's role
	 * If the user is a system admin, show all teams in the system.
	 * If user is not an admin, only show teams that the user belongs to
	 */
	initializeTeams() {
		return Observable.create((observer: any) => {
			this.teamsService.selectionList()
				.subscribe(
					(result: any) => {
						let results = (_.isArray(result)) ? result : result.elements;
						if (_.isArray(results)) {
							this.teamOptions = results.map((r: any) => new Team(r._id, r.name)).sort(this.sortByName);
						}

						observer.complete();
					},
					(err: any) => {
						observer.error(err);
					});
		});
	}

	initializeTags() {
		return Observable.create((observer: any) => {
			if (!this.showTags) {
				observer.complete();
			}
			else {
				this.tagsService.selectionList()
					.subscribe(
						(result: any) => {
							this.populateTagOptions(result);
							observer.complete();
						},
						(err: any) => {
							observer.error(err);
						}
					);
			}
		});
	}

	handleSelection() {
		if (null != this.preselectedTeam) {
			this.applyTeamFilter(this.preselectedTeam, false);
		}
		return Observable.empty();
	}

	populateTagOptions(result: any) {
		// Default to preselected tag or all tags
		this.selectedTag = (null != this.preselectedTag) ? this.preselectedTag : this.allTagOption;

		if (null != result && null != result.elements && result.elements.length > 0) {
			this.tagOptions = result.elements.map((r: any) => new Tag(r._id, r.name)).sort(this.sortByName);
		}
		else {
			this.tagOptions = [];
		}
	}

	/**
	 * Helper functions for team and tag filtering
	 */
	getTagsForTeam(t: Team) {
		return Observable.create((observer: any) => {
			// Get all tags or get tags for selected team
			let obs: Observable<any>;
			if (t._id === this.allTeamOption._id) {
				obs = this.tagsService.selectionList();
			}
			else {
				obs = this.tagsService.searchTags({ owner: { $in: [t._id] } }, null, new PagingOptions(0, 1000), {});
			}

			obs.subscribe(
				(result: any) => {
					this.populateTagOptions(result);
					observer.next();
				},
				(err: any) => {
					this.tagOptions = [];
					observer.error(err);
				},
				() => {
					observer.complete();
				});
		});
	}

	applyTeamFilter(t: Team, update: boolean = true) {
		if (update) {
			this.preselectedTag = null;
		}

		// Check that filter actually changed
		if (t._id !== this.selectedTeam._id) {
			this.selectedTeam = t;
			this.getTagsForTeam(t)
				.subscribe(
					() => {
						if (update) {
							this.updateSelection();
						}
					},
					(err: any) => {
						this.alertError.emit(err);
					});
		}
	}

	applyTagFilter(t: Tag) {
		// Check that the filter actually changed
		if (t._id !== this.selectedTag._id) {
			this.selectedTag = t;

			this.updateSelection();
		}
	}

	updateSelection() {
		let team = (this.selectedTeam._id === this.allTeamOption._id) ? null : this.selectedTeam;
		let tag = (this.selectedTag._id === this.allTagOption._id) ? null : this.selectedTag;

		this.setSelection.emit({tag: tag, team: team});
	}
}
