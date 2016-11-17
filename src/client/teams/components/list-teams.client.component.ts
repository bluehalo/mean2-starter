import * as _ from 'lodash';
import {NgFor} from "@angular/common";
import {Component, Inject, forwardRef} from '@angular/core';
import {Response} from "@angular/http";
import {Router, ROUTER_DIRECTIVES, RouteParams} from "@angular/router-deprecated";
import {AlertComponent, DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES} from "ng2-bootstrap/ng2-bootstrap";
import {Observable} from "rxjs/Observable";
import {Team, TeamMember, TeamsService} from "../services/teams.client.service";
import {ConfigService} from "../../../core/client/services/config.client.service";
import {User} from "../../../users/client/model/user.client.class";
import {AuthenticationService} from "../../../users/client/services/authentication.client.service";
import {Pager, PagingOptions} from "../../../util/client/components/pager.client.component";
import {AgoDatePipe} from "../../../util/client/pipes/ago-date.client.pipe";
import {AlertService} from "../../../util/client/services/alert.client.service";
import {AsyRouteMappings} from "../../../util/client/util/AsyRouteMappings.client.class";
import {SortDisplayOption, SortDirection} from "../../../util/client/util/result-utils.client.classes";

@Component({
	selector: 'list-teams',
	directives: [AlertComponent, Pager, DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES, ROUTER_DIRECTIVES],
	providers: [],
	pipes: [AgoDatePipe],
	templateUrl: '/app/teams/views/list-teams.client.view.html'
})

export class ListTeamsComponent {

	private user: TeamMember;

	private teams: Team[] = [];

	private search: string = '';

	private sortOptions: any = {};

	private pagingOptions: PagingOptions;

	constructor(
		private router: Router,
		private routeParams: RouteParams,
		private teamsService: TeamsService,
		public auth: AuthenticationService,
		public alertService: AlertService,
		@Inject(forwardRef(() => AsyRouteMappings)) protected asyRoutes
	) {}

	ngOnInit() {
		this.user = new TeamMember().setFromTeamMemberModel(null, this.auth.getCurrentUser().userModel);
		this.initializeTeams();
	}

	private initializeTeams() {
		this.alertService.clearAllAlerts();

		this.sortOptions.name = new SortDisplayOption('Team Name', 'name', SortDirection.asc);

		if (_.toString(this.routeParams.get('clearCachedFilter')) === 'true' || null == this.teamsService.cache.listTeams) {
			this.teamsService.cache.listTeams = {};
		}

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
