import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import * as _ from 'lodash';
import { BsModalService } from 'ngx-bootstrap';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { User } from '../user.class';
import { AdminService } from '../admin.service';
import { Role } from './role.class';
import { ExportUsersModal } from './export-users.component';
import { IPagingResults, PagingOptions } from '../../shared/pager.component';
import { TableSortOptions } from '../../shared/pageable-table/pageable-table.component' ;
import { SortDisplayOption, SortDirection } from '../../shared/result-utils.class';
import { AlertService } from '../../shared/alert.service';
import { ExportConfigService } from '../../shared/export-config.service';
import { ConfigService } from '../../core/config.service';
import { Team } from '../../teams/teams.class';
import { SelectTeamsComponent } from '../../teams/select-teams.component';
import { TeamsService } from '../../teams/teams.service';
import { ModalAction, ModalService } from '../../shared/asy-modal.service';

@Component({
	templateUrl: 'admin-list-users.component.html'
})
export class AdminListUsersComponent {

	@ViewChild(SelectTeamsComponent) selectTeamsComponent: SelectTeamsComponent;

	teamMap: any = {};

	users: any[] = [];

	pagingOpts: PagingOptions;

	search: string = '';

	// Columns to show/hide in user table
	columns: any = {
		name: {show: true, title: 'Name'},
		username: {show: true, title: 'Username'},
		_id: {show: false, title: 'ID'},
		teams: {show: true, title: 'Teams'},
		organization: {show: false, title: 'Organization'},
		email: {show: false, title: 'Email'},
		phone: {show: false, title: 'Phone'},
		acceptedEua: {show: false, title: 'EUA'},
		lastLogin: {show: true, title: 'Last Login'},
		created: {show: false, title: 'Created'},
		updated: {show: false, title: 'Updated'},
		bypassAccessCheck: {show: false, title: 'Bypass AC'},
		externalRoles: {show: false, title: 'External Roles'},
		externalGroups: {show: false, title: 'External Groups'},
		roles: {show: true, title: 'Roles'}
	};

	columnKeys: string[] = _.keys(this.columns);

	columnMode: string = 'default';

	sortOpts: TableSortOptions = {
		name: new SortDisplayOption('Name', 'name', SortDirection.asc),
		username: new SortDisplayOption('Username', 'username', SortDirection.asc),
		created: new SortDisplayOption('Created', 'created', SortDirection.desc),
		relevance: new SortDisplayOption('Relevance', 'score', SortDirection.desc)
	};

	filters: any;

	possibleRoles: Role[] = Role.ROLES;

	private sub: Subscription;

	private defaultColumns: any = JSON.parse(JSON.stringify(this.columns));

	private selectedTeam: Team;

	private requiredExternalRoles: string[];

	constructor(
		private modalService: BsModalService,
		private asyModalService: ModalService,
		private route: ActivatedRoute,
		private adminService: AdminService,
		private exportConfigService: ExportConfigService,
		private configService: ConfigService,
		private teamsService: TeamsService,
		public alertService: AlertService
	) {}

	ngOnInit() {
		this.sub = this.route.params.subscribe((params: Params) => {
			// Clear any alerts
			this.alertService.clearAllAlerts();

			// Clear cache if requested
			let clearCachedFilter = params[`clearCachedFilter`];
			if (_.toString(clearCachedFilter) === 'true' || null == this.adminService.cache.listUsers) {
				this.adminService.cache.listUsers = {};
			}
		});

		this.configService.getConfig().first().subscribe((config: any) => {
			this.requiredExternalRoles = _.isArray(config.requiredRoles) ? config.requiredRoles : [];

			this.initialize();
			this.loadUsers();
		});
	}

	ngOnDestroy() {
		this.teamsService.teamMap = {};
		this.sub.unsubscribe();
	}

	applySearch() {
		this.pagingOpts.setPageNumber(0);
		this.loadUsers();
	}

	goToPage(event: any) {
		this.pagingOpts.update(event.pageNumber, event.pageSize);
		this.loadUsers();
	}

	setSort(sortOpt: SortDisplayOption) {
		this.pagingOpts.sortField = sortOpt.sortField;
		this.pagingOpts.sortDir = sortOpt.sortDir;
		this.loadUsers();
	}

	setSelectedTeam(event: any) {
		if (event.hasOwnProperty('team')) {
			this.selectedTeam = event.team;
		}
		this.loadUsers();
	}

	confirmDeleteUser(user: User) {
		const id = user.userModel._id;
		const username = user.userModel.username;

		this.asyModalService
			.confirm('Delete user?', `Are you sure you want to delete user: '${user.userModel.username}" ?`, 'Delete')
			.first()
			.filter((action: ModalAction) => action === ModalAction.OK)
			.switchMap(() => this.adminService.removeUser(id))
			.subscribe(() => {
				this.alertService.addAlert(`Deleted user: ${username}`, 'success');
				this.loadUsers();
			}, (error: HttpErrorResponse) => {
				this.alertService.addAlert(error.error.message);
			});
	}

	exportUserData() {
		this.modalService.show(ExportUsersModal, { ignoreBackdropClick: true });
	}

	exportCurrentView() {
		let viewColumns = _.keys(this.columns)
			.filter((key: string) => this.columns[key].show)
			.map((key: any) => ({key: key, title: this.columns[key].title}));

		let rolesIndex = _.findIndex(viewColumns, (pair: any) => pair.key === 'roles');

		if (rolesIndex !== -1) {
			viewColumns.splice(rolesIndex, 1,
				{key: 'roles.user', title: 'User Role'},
				{key: 'roles.editor', title: 'Editor Role'},
				{key: 'roles.auditor', title: 'Auditor Role'},
				{key: 'roles.admin', title: 'Admin Role'});
		}

		this.exportConfigService.postExportConfig('user', {
			q: this.getQuery(),
			s: this.search,
			cols: viewColumns,
			sort: this.sortOpts['name'].sortField,
			dir: this.sortOpts['name'].sortDir})
			.subscribe((response: any) => {
				window.open(`/admin/users/csv/${response._id}`);
			});
	}

	checkColumnConfiguration() {
			// Check first to see if all columns are turned on
		this.columnMode = 'all';
		this.columnKeys.some((name: string) => {
			if (this.columns[name].show !== true) {
				this.columnMode = 'custom';
				return true;
			}
		});

		if (this.columnMode === 'all') {
			return;
		}

		// Check if our default columns are enabled
		this.columnMode = 'default';
		this.columnKeys.some( (name: string) => {
			if (this.columns[name].show !== this.defaultColumns[name].show) {
				this.columnMode = 'custom';
				return true;
			}
		});
	}

	quickColumnSelect(selection: string) {
		if (selection === 'all') {
			this.columnKeys.forEach( (name: string) =>	this.columns[name].show = true);

		} else if (selection === 'default') {
			this.columns = JSON.parse(JSON.stringify(this.defaultColumns));
		}
		this.checkColumnConfiguration();
	}

	showAlertMessage(event: any) {
		if (null != event && null != event.message) {
			this.alertService.addAlert(event.message);
		}
	}

	/**
	 * Initialize query, search, and paging options, possibly from cached user settings
	 */
	private initialize() {
		let cachedFilter = this.adminService.cache.listUsers;

		this.search = cachedFilter.search ? cachedFilter.search : '';
		this.filters = cachedFilter.filters ? cachedFilter.filters : {
			bypassAC: false,
			editorRole: false,
			auditorRole: false,
			adminRole: false,
			pending: false
		};

		if (cachedFilter.paging) {
			this.pagingOpts = cachedFilter.paging;
		} else {
			this.pagingOpts = new PagingOptions();
			this.pagingOpts.sortField = this.sortOpts['name'].sortField;
			this.pagingOpts.sortDir = this.sortOpts['name'].sortDir;
		}

		if (cachedFilter.team) {
			this.selectedTeam = new Team(cachedFilter.team._id, cachedFilter.team.name);
		}

		this.selectTeamsComponent.setSelectionInput(null, this.selectedTeam);
	}

	private loadUsers() {
		let options: any = {};

		this.adminService.cache.listUsers = {
			filters: this.filters,
			search: this.search,
			paging: this.pagingOpts,
			team: this.selectedTeam,
		};

		let obs: Observable<IPagingResults> = (null != this.selectedTeam) ?
			this.teamsService.searchMembers(this.selectedTeam._id, null, this.getQuery(), this.search, this.pagingOpts) :
			this.adminService.search(this.getQuery(), this.search, this.pagingOpts, options);

		obs.subscribe((result: IPagingResults) => {
			this.users = result.elements;
			this.teamMap = this.teamsService.teamMap;
			if (this.users.length > 0) {
				this.pagingOpts.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
			}
			else {
				this.pagingOpts.reset();
			}
		});
	}

	private getQuery(): any {
		let query: any;
		let elements: any[] = [];

		if (this.filters.bypassAC) {
			elements.push({ bypassAccessCheck: true });
		}

		if (this.filters.editorRole) {
			elements.push({ 'roles.editor': true });
		}

		if (this.filters.auditorRole) {
			elements.push({ 'roles.auditor': true });
		}

		if (this.filters.adminRole) {
			elements.push({ 'roles.admin': true });
		}

		if (this.filters.pending) {
			let filter: any = {
				$or: [ { 'roles.user': {$ne: true} } ]
			};
			if (this.requiredExternalRoles.length > 0) {
				filter.$or.push({ $and: [
					{bypassAccessCheck: {$ne: true}},
					{externalRoles: {$not: {$all: this.requiredExternalRoles}}}
				]
				});
			}
			elements.push(filter);
		}

		if (elements.length > 0) {
			query = { $or: elements };
		}
		return query;
	}
}
