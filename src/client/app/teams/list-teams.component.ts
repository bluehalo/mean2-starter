import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import * as _ from 'lodash';

import { Team, TeamMember } from './teams.class';
import { TeamsService } from './teams.service';
import { SortDirection, SortDisplayOption } from '../shared/result-utils.class';
import { PagingOptions } from '../shared/pager.component';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { AlertService } from '../shared/alert.service';

@Component({
	selector: 'list-teams',
	templateUrl: './list-teams.component.html'
})
export class ListTeamsComponent {

	private user: TeamMember;

	private teams: Team[] = [];

	private search: string = '';

	private sortOptions: any = {};

	private pagingOptions: PagingOptions;

	constructor(
		private route: ActivatedRoute,
		private teamsService: TeamsService,
		private authService: AuthenticationService,
		private alertService: AlertService
	) {
	}

	ngOnInit() {
		this.user = new TeamMember().setFromTeamMemberModel(null, this.authService.getCurrentUser().userModel);
		this.initializeTeams();
	}

	private initializeTeams() {
		this.alertService.clearAllAlerts();

		this.sortOptions.name = new SortDisplayOption('Team Name', 'name', SortDirection.asc);

		this.route.params.subscribe((params: Params) => {
			let clearCachedFilter = params[`clearCachedFilter`];
			if (_.toString(clearCachedFilter) === 'true' || null == this.teamsService.cache.listTeams) {
				this.teamsService.cache.listTeams = {};
			}
		});

		this.initializeUserFilters();
		this.loadTeams();
	}

	/**
	 * Initialize query, search, and paging options, possibly from cached user settings
	 */
	private initializeUserFilters() {
		let cachedFilter = this.teamsService.cache.listTeams;

		this.search = cachedFilter.search ? cachedFilter.search : '';
		if (cachedFilter.paging) {
			this.pagingOptions = cachedFilter.paging;
		} else {
			this.pagingOptions = new PagingOptions();
			this.pagingOptions.sortField = this.sortOptions.name.sortField;
			this.pagingOptions.sortDir = this.sortOptions.name.sortDir;
		}
	}

	private goToPage(event: any) {
		this.pagingOptions.update(event.pageNumber, event.pageSize);
		this.loadTeams();
	}

	private applySearch() {
		this.pagingOptions.setPageNumber(0);
		this.loadTeams();
	}

	private loadTeams() {
		let query: any = {};
		let options: any = {};

		this.teamsService.cache.listTeams = {search: this.search, paging: this.pagingOptions};
		this.teamsService.search(query, this.search, this.pagingOptions, options)
			.subscribe((result: any) => {
				if (null != result && null != result.elements && result.elements.length > 0) {
					this.teams = result.elements.map(function(e: any) {
						return new Team(e._id, e.name, e.description, e.created);
					});
					this.pagingOptions.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
				} else {
					this.teams = [];
					this.pagingOptions.reset();
				}
			});
	}
}
