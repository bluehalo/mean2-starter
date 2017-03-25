import { Component } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';

import * as _ from 'lodash';
import { Modal } from 'angular2-modal/plugins/bootstrap';

import { Team, TeamMember } from './teams.class';
import { TeamsService } from './teams.service';
import { SortDirection, SortDisplayOption } from '../shared/result-utils.class';
import { PagingOptions } from '../shared/pager.component';
import { TableSortOptions } from '../shared/pageable-table/pageable-table.component';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { AlertService } from '../shared/alert.service';

@Component({
	selector: 'list-teams',
	templateUrl: './list-teams.component.html'
})
export class ListTeamsComponent {

	user: TeamMember;
	teams: Team[] = [];
	search: string = '';
	sortOptions: TableSortOptions = {
		name: new SortDisplayOption('Team Name', 'name', SortDirection.asc)
	};
	pagingOptions: PagingOptions;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private modal: Modal,
		private teamsService: TeamsService,
		private authService: AuthenticationService,
		public alertService: AlertService
	) {
	}

	ngOnInit() {
		this.user = this.teamsService.getCurrentUserAsTeamMember();
		this.initializeTeams();
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
		this.modal.confirm()
			.size('lg')
			.showClose(true)
			.isBlocking(true)
			.title('Delete team?')
			.body(`Are you sure you want to delete the team: <strong>"${team.name}"</strong>?<br/>This action cannot be undone.`)
			.okBtn('Delete')
			.open()
			.then(
				(resultPromise: any) => resultPromise.result.then(
					// Success
					() => {
						this.teamsService.delete(team._id)
							.subscribe(
								() => {
									this.authService.reloadCurrentUser().subscribe(() => {
										this.router.navigate(['/teams', {clearCachedFilter: true}]);
									});
								},
								(response: Response) => {
									if (response.status >= 400 && response.status < 500) {
										this.alertService.addAlert(response.json().message);
									}
								});
					},
					// Failure
					() => {}
				)
			);
	}

	private initializeTeams() {
		this.alertService.clearAllAlerts();

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

	private loadTeams() {
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
