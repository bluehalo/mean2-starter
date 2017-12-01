import { Component, Output, EventEmitter, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ObservableUtils } from '../shared/observable-utils.class';
import { TagsService } from './tags/tags.service';
import { TeamsService } from './teams.service';
import { TeamMember, Team } from './teams.class';
import { Tag } from './tags/tags.class';
import { IPagingResults, NULL_PAGING_RESULTS, PagingOptions } from '../shared/pager.component';

@Component({
	selector: 'select-teams',
	templateUrl: 'select-teams.component.html'
})
export class SelectTeamsComponent {

	@Input() showTags: boolean = true;

	@Output() alertError = new EventEmitter();

	@Output() setSelection = new EventEmitter();

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

	private user: TeamMember;

	constructor(
		private tagsService: TagsService,
		private teamsService: TeamsService
	) {}

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

	applyTeamFilter(t: Team, update: boolean = true) {
		if (update) {
			this.preselectedTag = null;
		}

		// Check that filter actually changed
		if (t._id !== this.selectedTeam._id) {
			this.selectedTeam = t;
			this.getTagsForTeam(t).subscribe(() => {
				if (update) {
					this.updateSelection();
				}
			}, (error: HttpErrorResponse) => {
				this.alertError.emit(error);
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

	private sortByName(a: any, b: any) {
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
	private initializeTeams(): Observable<IPagingResults> {
		return this.teamsService.selectionList().map((result: IPagingResults) => {
			this.teamOptions = result.elements.sort(this.sortByName);
			return result;
		});
	}

	private initializeTags(): Observable<IPagingResults> {
		if (!this.showTags) {
			return Observable.of(NULL_PAGING_RESULTS);
		}

		return this.tagsService.selectionList().map((result: IPagingResults) => {
			this.populateTagOptions(result);
			return result;
		});
	}

	private handleSelection() {
		if (null != this.preselectedTeam) {
			this.applyTeamFilter(this.preselectedTeam, false);
		}
		return Observable.empty();
	}

	private populateTagOptions(result: IPagingResults) {
		this.selectedTag = (null != this.preselectedTag) ? this.preselectedTag : this.allTagOption;
		this.tagOptions = result.elements;
	}

	/**
	 * Helper functions for team and tag filtering
	 */
	private getTagsForTeam(t: Team): Observable<IPagingResults> {
		let obs: Observable<IPagingResults> = (t._id === this.allTeamOption._id)
			? this.tagsService.selectionList()
			: this.tagsService.searchTags({ owner: { $in: [t._id] } }, null, new PagingOptions(0, 1000), {});

		return obs.do((result: IPagingResults) => this.populateTagOptions(result));
	}

	private updateSelection() {
		let team = (this.selectedTeam._id === this.allTeamOption._id) ? null : this.selectedTeam;
		let tag = (this.selectedTag._id === this.allTagOption._id) ? null : this.selectedTag;

		this.setSelection.emit({tag: tag, team: team});
	}
}
