import { Component } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';

import * as _ from 'lodash';

import { Team, TeamMember } from './teams.class';
import { TeamsService } from './teams.service';
import { SortDirection, SortDisplayOption } from '../shared/result-utils.class';
import { PagingOptions } from '../shared/pager.component';
import { TableSortOptions } from '../shared/pageable-table/pageable-table.component';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { AlertService } from '../shared/alert.service';
import { ModalAction, ModalService } from '../shared/asy-modal.service';

@Component({
	templateUrl: 'list-teams.component.html'
})
export class ListTeamsComponent {

	user: TeamMember;

	teams: Team[] = [];

	search: string = '';

	canManageSystemResources: boolean = false;

	sortOptions: TableSortOptions = {
		name: new SortDisplayOption('Team Name', 'name', SortDirection.asc)
	};

	pagingOptions: PagingOptions;

	constructor(
		private modalService: ModalService,
		private router: Router,
		private route: ActivatedRoute,
		private teamsService: TeamsService,
		private authService: AuthenticationService,
		public alertService: AlertService
	) {
	}

	ngOnInit() {
		this.user = this.teamsService.getCurrentUserAsTeamMember();
		this.canManageSystemResources = this.user.canManageSystemResources();

		this.alertService.clearAllAlerts();
		this.route.params.subscribe((params: Params) => {
			const clearCachedFilter = params[`clearCachedFilter`];
			if (_.toString(clearCachedFilter) === 'true' || null == this.teamsService.cache.listTeams) {
				this.teamsService.cache.listTeams = {};
			}

			this.initializeUserFilters();
			this.loadTeams();
		});
	}

	goToPage(event: any) {
		this.pagingOptions.update(event.pageNumber, event.pageSize);
		this.loadTeams();
	}

	applySearch() {
		this.pagingOptions.setPageNumber(0);
		this.loadTeams();
	}

	updateTeam(team: Team) {
		this.router.navigate(['/team/edit', team._id]);
	}

	deleteTeam(team: Team) {
		this.modalService
			.confirm('Delete team?', `Are you sure you want to delete the team: <strong>"${team.name}"</strong>?<br/>This action cannot be undone.`, 'Delete')
			.first()
			.filter((action: ModalAction) => action === ModalAction.OK)
			.switchMap(() => {
				return this.teamsService.delete(team._id);
			})
			.switchMap(() => {
				return this.authService.reloadCurrentUser();
			})
			.subscribe(() => {
										this.alertService.addAlert(`Successfully deleted ${team.name}`, 'success');
										this.loadTeams();
			}, (response: Response) => {
									if (response.status >= 400 && response.status < 500) {
										this.alertService.addAlert(response.json().message);
									}
								});
	}

	/**
	 * Initialize query, search, and paging options, possibly from cached user settings
	 */
	initializeUserFilters() {
		let cachedFilter: any = this.teamsService.cache.listTeams;

		this.search = cachedFilter.search ? cachedFilter.search : '';
		if (cachedFilter.paging) {
			this.pagingOptions = cachedFilter.paging;
		} else {
			this.pagingOptions = new PagingOptions();
			this.pagingOptions.sortField = this.sortOptions['name'].sortField;
			this.pagingOptions.sortDir = this.sortOptions['name'].sortDir;
		}
	}

	loadTeams() {
		let query: any = {};
		let options: any = {};

		this.teamsService.cache.listTeams = {search: this.search, paging: this.pagingOptions};
		this.teamsService.search(query, this.search, this.pagingOptions, options)
			.subscribe((result: any) => {
				if (null != result && null != result.elements && result.elements.length > 0) {
					this.teams = result.elements.map((e: any) => new Team(e._id, e.name, e.description, e.created) );
					this.pagingOptions.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
				} else {
					this.teams = [];
					this.pagingOptions.reset();
				}
			});
	}

}
