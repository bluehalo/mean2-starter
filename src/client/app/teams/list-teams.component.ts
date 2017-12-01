import { Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import * as _ from 'lodash';
import { Subscription } from 'rxjs/Subscription';

import { Team, TeamMember } from './teams.class';
import { TeamsService } from './teams.service';
import { SortDirection, SortDisplayOption } from '../shared/result-utils.class';
import { IPagingResults, PagingOptions } from '../shared/pager.component';
import { TableSortOptions } from '../shared/pageable-table/pageable-table.component';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { AlertService } from '../shared/alert.service';
import { ModalAction, ModalService } from '../shared/asy-modal.service';

@Component({
	selector: 'list-teams',
	templateUrl: 'list-teams.component.html'
})
export class ListTeamsComponent implements OnDestroy {

	user: TeamMember;

	teams: Team[] = [];

	search: string = '';

	sortOptions: TableSortOptions = {
		name: new SortDisplayOption('Team Name', 'name', SortDirection.asc)
	};

	pagingOptions: PagingOptions;

	private routeParamsSubscription: Subscription;

	constructor(
		private modalService: ModalService,
		private router: Router,
		private route: ActivatedRoute,
		private teamsService: TeamsService,
		private authService: AuthenticationService,
		public alertService: AlertService
	) {}

	ngOnInit() {
		this.user = this.teamsService.getCurrentUserAsTeamMember();

		this.alertService.clearAllAlerts();
		this.routeParamsSubscription = this.route.params.subscribe((params: Params) => {
			const clearCachedFilter = params[`clearCachedFilter`];
			if (_.toString(clearCachedFilter) === 'true' || null == this.teamsService.cache.listTeams) {
				this.teamsService.cache.listTeams = {};
			}

			this.initializeUserFilters();
			this.loadTeams();
		});
	}

	ngOnDestroy() {
		this.routeParamsSubscription.unsubscribe();
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
			.switchMap(() => this.teamsService.delete(team._id))
			.switchMap(() => this.authService.reloadCurrentUser())
			.subscribe(() => {
				this.alertService.addAlert(`Successfully deleted ${team.name}`, 'success');
				this.loadTeams();
			}, (error: HttpErrorResponse) => this.alertService.addClientErrorAlert(error));
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
		this.teamsService.search(query, this.search, this.pagingOptions, options).subscribe((result: IPagingResults) => {
			this.teams = result.elements;
			if (this.teams.length > 0) {
				this.pagingOptions.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
			}
			else {
				this.pagingOptions.reset();
			}
		});
	}
}
