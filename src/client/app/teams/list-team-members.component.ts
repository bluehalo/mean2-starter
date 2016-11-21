import { Component, Input } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';

import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { Modal } from 'angular2-modal/plugins/bootstrap';

import { Team, TeamMember, TeamRole } from './teams.class';
import { TeamsService } from './teams.service';
import { User } from '../admin/user.class';
import { UserService } from '../admin/users.service';
import { PagingOptions } from '../shared/pager.component';
import { SortDirection, SortDisplayOption } from '../shared/result-utils.class';
import { AlertService } from '../shared/alert.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';

@Component({
	selector: 'list-team-members',
	templateUrl: './list-team-members.component.html'
})
export class ListTeamMembersComponent {

	@Input() readOnly: boolean = true;

	private team: Team;

	private teamMembers: TeamMember[] = [];

	private teamId: string;

	private teamRoleOptions: any[] = TeamRole.ROLES;

	private user: User;

	private queryUserSearchTerm: string = '';

	private queryUserObj: User;

	private sortOptions: any = {};

	private pagingOptions: PagingOptions;

	private searchUsersRef: Observable<any>;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private modal: Modal,
		private teamsService: TeamsService,
		private userService: UserService,
		private alertService: AlertService,
		private authService: AuthenticationService
	) {
	}

	ngOnInit() {
		this.alertService.clearAllAlerts();

		this.user = this.authService.getCurrentUser();

		this.team = new Team();

		this.sortOptions.name = new SortDisplayOption('Name', 'name', SortDirection.asc);
		this.sortOptions.username = new SortDisplayOption('Username', 'username', SortDirection.asc);

		this.pagingOptions = new PagingOptions();
		this.pagingOptions.sortField = this.sortOptions.name.sortField;
		this.pagingOptions.sortDir = this.sortOptions.name.sortDir;

		this.route.params.subscribe((params: Params) => {
			this.teamId = params[`id`];

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
		});

		// Bind the search users typeahead to a function
		this.searchUsersRef = Observable.create((observer: any) => {
			this.userService.match({}, this.queryUserSearchTerm, this.pagingOptions)
				.subscribe((result: any) => {
					let formatted = result.elements
						.filter((e: any) => {
							return (-1 === _.findIndex(this.teamMembers, (m: TeamMember) => m.userModel._id === e._id ));
						})
						.map((r: any) => {
							r.displayName = r.name + ' [' + r.username + ']';
							return r;
						});
					observer.next(formatted);
				});
		});
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
					(resultPromise: any) => resultPromise.result.then(
						() => {
							this.doUpdateRole(member, role)
								.subscribe(() => {
										this.authService.reloadCurrentUser().subscribe(() => {
											// If we successfully removed the role from ourselves, redirect away
											this.router.navigate(['/teams', {clearCachedFilter: true}]);
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
					this.authService.reloadCurrentUser().subscribe(() => {
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
				(resultPromise: any) => resultPromise.result.then(
					() => {
						this.teamsService.removeMember(this.teamId, member.userModel._id)
							.subscribe(() => {
									this.authService.reloadCurrentUser().subscribe(() => {
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
