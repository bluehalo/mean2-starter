import {Component, Input, forwardRef, Inject, ViewContainerRef} from '@angular/core';
import {Response} from "@angular/http";
import {ROUTER_DIRECTIVES, Router, RouteParams} from "@angular/router-deprecated";
import {DialogRef} from "angular2-modal/angular2-modal";
import {Modal} from "angular2-modal/plugins/bootstrap";
import {AlertComponent, TYPEAHEAD_DIRECTIVES} from "ng2-bootstrap/ng2-bootstrap";
import {Observable} from "rxjs/Observable";
import {Team, TeamMember, TeamRole, TeamsService} from "../services/teams.client.service";
import {User} from "../../../users/client/model/user.client.class";
import {AuthenticationService} from "../../../users/client/services/authentication.client.service";
import {UserService} from "../../../users/client/services/users.client.service";
import {PagingOptions, Pager} from "../../../util/client/components/pager.client.component";
import {AlertService} from "../../../util/client/services/alert.client.service";
import {AsyRouteMappings} from "../../../util/client/util/AsyRouteMappings.client.class";
import {SortDirection, SortDisplayOption} from "../../../util/client/util/result-utils.client.classes";

@Component({
	selector: 'list-team-members',
	directives: [AlertComponent, ROUTER_DIRECTIVES, TYPEAHEAD_DIRECTIVES],
	providers: [],
	templateUrl: '/app/teams/views/list-team-members.client.view.html'
})

export class ListTeamMembersComponent {

	@Input() readOnly: boolean = true;

	private team: Team;

	private teamMembers: TeamMember[] = [];

	private teamId: string;

	private teamRoleOptions:any[] = TeamRole.ROLES;

	private user: User;

	private queryUserSearchTerm: string = '';

	private queryUserObj: User;

	private search: string = '';

	private error: string = null;

	private sortOptions: any = {};

	private pagingOptions: PagingOptions;

	constructor(
		private router: Router,
		private modal: Modal,
		private viewContainer: ViewContainerRef,
		private routeParams: RouteParams,
		private teamsService: TeamsService,
		private userService: UserService,
		public alertService: AlertService,
		public auth: AuthenticationService,
		@Inject(forwardRef(() => AsyRouteMappings)) protected asyRoutes
	) {
		this.modal.defaultViewContainer = viewContainer;
	}

	ngOnInit() {
		this.alertService.clearAllAlerts();

		this.user = this.auth.getCurrentUser();

		this.team = new Team();
		this.teamId = this.routeParams.get('id');

		this.sortOptions.name = new SortDisplayOption('Name', 'name', SortDirection.asc);
		this.sortOptions.username = new SortDisplayOption('Username', 'username', SortDirection.asc);

		this.pagingOptions = new PagingOptions();
		this.pagingOptions.sortField = this.sortOptions.name.sortField;
		this.pagingOptions.sortDir = this.sortOptions.name.sortDir;

		// Initialize team if appropriate
		if (this.teamId) {
			this.teamsService.get(this.teamId)
				.subscribe((result: any) => {
					if (result) {
						this.team = new Team(result._id, result.name, result.description, result.created, result.requiresExternalTeams);
						this.getTeamMembers();
					}
				});
		}
	}

	private typeaheadOnSelect(e: any) {
		setTimeout(() => {
			this.queryUserObj = new TeamMember().setFromTeamMemberModel(this.team, e.item);
			this.addMember(this.queryUserObj);
			this.queryUserSearchTerm = '';
		}, 0);
	}

	private goToPage(event: any) {
		this.pagingOptions.update(event.pageNumber, event.pageSize);
		this.getTeamMembers();
	}

	private setSort(sortOpt: SortDisplayOption) {
		this.pagingOptions.sortField = sortOpt.sortField;
		this.pagingOptions.sortDir = sortOpt.sortDir;

		this.getTeamMembers();
	};

	private getTeamMembers() {
		this.teamsService.searchMembers(this.teamId, null, null, this.pagingOptions)
			.subscribe((result: any) => {
				if (null != result && null != result.elements && result.elements.length > 0) {
					this.teamMembers = result.elements.map((e: any) => new TeamMember().setFromTeamMemberModel(this.team, e));
					this.pagingOptions.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
				} else {
					this.teamMembers = [];
					this.pagingOptions.reset();
				}
			});
	}

	private searchUsersRef = this.searchUsers.bind(this);

	private searchUsers() {
		return this.userService.match({}, this.queryUserSearchTerm, this.pagingOptions)
			.map((result) => {
				return result.elements.filter((e:any) => {
					return (-1 === _.findIndex(this.teamMembers, function(m: TeamMember) { return m.userModel._id === e._id; }));
				})
				.map(function(r: any) {
					r.displayName = r.name + ' [' + r.username + ']';
					return r;
				});
			}).toPromise();
	}

	private doUpdateRole(member: TeamMember, role: string): Observable<Response> {
		return this.teamsService.updateMemberRole(this.teamId, member.userModel._id, role);
	}

	private updateRole(member: TeamMember, role: string) {
		// No update required
		if (member.role === role) {
			return;
		}

		// If user is removing their own admin, verify that they know what they're doing
		if (this.user.userModel._id === member.userModel._id && member.role === 'admin' && role !== 'admin') {
			this.modal.confirm()
				.size('lg')
				.showClose(true)
				.isBlocking(true)
				.title('Remove "Team Admin" role?')
				.body(`Are you sure you want to remove <strong>yourself</strong> from the Team Admin role?<br/>Once you do this, you will no longer be able to manage the members of this team. <br/><strong>This also means you won\'t be able to give the role back to yourself.</strong>`)
				.okBtn('Remove Admin')
				.open()
				.then(
					resultPromise => resultPromise.result.then(
						() => {
							this.doUpdateRole(member, role)
								.subscribe(() => {
										this.auth.reloadCurrentUser().subscribe(() => {
											// If we successfully removed the role from ourselves, redirect away
											this.router.navigate([this.asyRoutes.getPath('Teams'), {clearCachedFilter: true}]);
										});
									},
									(response: Response) => {
										if (response.status >= 400 && response.status < 500) {
											this.alertService.addAlert(response.json().message);
										}
									});
						}
					)
				);
		}
		else if (!member.explicit) {
			// Member is implicitly in team, should explicitly add this member with the desired role
			this.addMember(member, role);
		}
		else {
			this.doUpdateRole(member, role)
				.subscribe(() => {
						this.getTeamMembers();
					},
					(response: Response) => {
						if (response.status >= 400 && response.status < 500) {
							this.alertService.addAlert(response.json().message);
						}
					});
		}
	}

	private addMember(member: User, role?: string) {
		if (null == this.teamId || null == member) {
			this.alertService.addAlert('Failed to add member. Missing member or teamId.');
			return;
		}

		this.teamsService.addMember(this.teamId, member.userModel._id, role)
			.subscribe(() => {
					this.auth.reloadCurrentUser().subscribe(() => {
						this.getTeamMembers();
					});
				},
				(response: Response) => {
					if (response.status >= 400 && response.status < 500) {
						this.alertService.addAlert(response.json().message);
					}
				});
	}

	private removeMember(member: TeamMember) {
		this.modal.confirm()
			.size('lg')
			.showClose(true)
			.isBlocking(true)
			.title('Remove member from team?')
			.body(`Are you sure you want to remove member: "${member.userModel.name}" from this team?`)
			.okBtn('Remove Member')
			.open()
			.then(
				resultPromise => resultPromise.result.then(
					() => {
						this.teamsService.removeMember(this.teamId, member.userModel._id)
							.subscribe(() => {
									this.auth.reloadCurrentUser().subscribe(() => {
										this.getTeamMembers();
									});
								},
								(response: Response) => {
									if (response.status >= 400 && response.status < 500) {
										this.alertService.addAlert(response.json().message);
									}
								});
					}
				)
			);
	}
}
