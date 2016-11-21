import { Component, ViewContainerRef } from '@angular/core';
import { Response } from '@angular/http';
import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import { DialogRef, overlayConfigFactory } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap';

import { User } from '../user.class';
import { AdminService } from '../admin.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { Role } from './role.class';
import { ExportUsersModalContext, ExportUsersModal } from './export-users.component';
import { PagingOptions } from '../../shared/pager.component';
import { SortDisplayOption, SortDirection } from '../../shared/result-utils.class';
import { AlertService } from '../../shared/alert.service';
import { ExportConfigService } from '../../shared/export-config.service';
import { ConfigService } from '../../core/config.service';

@Component({
	templateUrl: './admin-list-users.component.html'
})
export class AdminListUsersComponent {

	private users: User[] = [];
	private pagingOpts: PagingOptions;
	private search: string = '';
	private userToDelete: User = null;
	private exportModalVisible: boolean = false;
	private requiredExternalRoles: string[];

	// Columns to show/hide in user table
	private columns: any = {
		name: {show: true, title: 'Name'},
		username: {show: true, title: 'Username'},
		_id: {show: false, title: 'ID'},
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
	private columnKeys: string[] = _.keys(this.columns);
	private defaultColumns: any = JSON.parse(JSON.stringify(this.columns));
	private columnMode: string = 'default';

	private sortOpts: any = {
		name: new SortDisplayOption('Name', 'name', SortDirection.asc),
		username: new SortDisplayOption('Username', 'username', SortDirection.asc),
		created: new SortDisplayOption('Created', 'created', SortDirection.desc),
		relevance: new SortDisplayOption('Relevance', 'score', SortDirection.desc)
	};
	private filters: any;
	private possibleRoles: Role[] = Role.ROLES;

	private sub: any;

	constructor(
		// private router: Router,
		private adminService: AdminService,
		private auth: AuthenticationService,
		private alertService: AlertService,
		private exportConfigService: ExportConfigService,
		private route: ActivatedRoute,
		private configService: ConfigService,
		private modal: Modal
	) {}

	ngOnInit() {
		this.sub = this.route.params.subscribe((params: any) => {
			this.configService.getConfig().subscribe((config: any) => {
				this.requiredExternalRoles = _.isArray(config.requiredRoles) ? config.requiredRoles : [];
			});

			this.alertService.clearAllAlerts();
			if (_.toString(params.clearCachedFilter) === 'true' || null == this.adminService.cache.listUsers) {
				this.adminService.cache.listUsers = {};
			}

			this.initializeUserFilters();

			this.loadUsers();
		});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	/**
	 * Initialize query, search, and paging options, possibly from cached user settings
	 */
	initializeUserFilters() {
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
			this.pagingOpts.sortField = this.sortOpts.name.sortField;
			this.pagingOpts.sortDir = this.sortOpts.name.sortDir;
		}
	}
	private loadUsers() {
		let options: any = {};
		this.adminService.cache.listUsers = {filters: this.filters, search: this.search, paging: this.pagingOpts};
		this.adminService.search(this.getQuery(), this.search, this.pagingOpts, options)
			.subscribe((result: any) => {
				if (result && Array.isArray(result.elements)) {
					this.users = result.elements.map((element: any) => {
						return new User().setFromUserModel(element);
					});
					this.pagingOpts.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
				} else {
					this.pagingOpts.reset();
				}
			}, (err: any): any => null );
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

	private applySearch(event: any) {
		this.pagingOpts.setPageNumber(0);
		this.loadUsers();
	}

	private goToPage(event: any) {
		this.pagingOpts.update(event.pageNumber, event.pageSize);
		this.loadUsers();
	}

	private setSort(sortOpt: SortDisplayOption) {
		this.pagingOpts.sortField = sortOpt.sortField;
		this.pagingOpts.sortDir = sortOpt.sortDir;
		this.loadUsers();
	};

	private confirmDeleteUser(user: User) {
		this.userToDelete = user;

		let dialogPromise: Promise<DialogRef<any>>;
		dialogPromise = this.modal.alert()
			.size('lg')
			.showClose(true)
			.isBlocking(true)
			.title('Delete user?')
			.body(`Are you sure you want to delete user: '${user.userModel.username}" ?`)
			.okBtn('Delete')
			.open();

		dialogPromise.then(
			(resultPromise: any) => resultPromise.result.then(
				// Success
				() => {
					let id = user.userModel._id;
					let username = user.userModel.username;
					this.adminService.removeUser(id).subscribe(() => {
							this.alertService.addAlert(`Deleted user: ${username}`, 'success');
							this.loadUsers();
						},
						(response: Response) => { this.alertService.addAlert(response.json().message); });
				},
				// Fail
				() => {}
			)
		);
	}

	private exportUserData() {
		this.modal.open(ExportUsersModal, overlayConfigFactory({}, ExportUsersModalContext));
	}

	private exportCurrentView() {
		let viewColumns = _.keys(this.columns)
			.filter((key: string) => {
				return this.columns[key].show;
			})
			.map((key: any) => {
				return {key: key, title: this.columns[key].title};
			});

		let rolesIndex = _.findIndex(viewColumns, (pair: any) => {
			return pair.key === 'roles';
		});

		if (rolesIndex !== -1) {
			viewColumns.splice(rolesIndex, 1,
				{key: 'roles.user', title: 'User Role'},
				{key: 'roles.editor', title: 'Editor Role'},
				{key: 'roles.auditor', title: 'Auditor Role'},
				{key: 'roles.admin', title: 'Admin Role'});
		}

		this.exportConfigService.postCSVParams('user', {
			q: this.getQuery(),
			s: this.search,
			cols: viewColumns,
			sort: this.sortOpts.name.sortField,
			dir: this.sortOpts.name.sortDir})
			.subscribe((response: any) => {
				window.open(`/admin/users/csv/${response._id}`);
			});
	}

	private doneExporting() {
		this.exportModalVisible = false;
	}

	private checkColumnConfiguration() {
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

	private quickColumnSelect(selection: string) {
		if (selection === 'all') {
			this.columnKeys.forEach( (name: string) =>	this.columns[name].show = true);

		} else if (selection === 'default') {
			this.columns = JSON.parse(JSON.stringify(this.defaultColumns));
		}
		this.checkColumnConfiguration();
	}
}
