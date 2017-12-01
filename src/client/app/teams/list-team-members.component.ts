import { Component, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Team, TeamMember, TeamRole } from './teams.class';
import { TeamsService } from './teams.service';
import { User } from '../admin/user.class';
import { UserService } from '../admin/users.service';
import { IPagingResults, PagingOptions } from '../shared/pager.component';
import { TableSortOptions } from '../shared/pageable-table/pageable-table.component';
import { SortDirection, SortDisplayOption } from '../shared/result-utils.class';
import { AlertService } from '../shared/alert.service';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { ModalAction, ModalService } from '../shared/asy-modal.service';

@Component({
	selector: 'list-team-members',
	templateUrl: 'list-team-members.component.html'
})
export class ListTeamMembersComponent implements OnDestroy {

	@Input() readOnly: boolean = true;

	team: Team;

	teamMembers: TeamMember[] = [];

	teamId: string;

	teamRoleOptions: any[] = TeamRole.ROLES;

	user: User;

	queryUserSearchTerm: string = '';

	queryUserObj: User;

	sortOptions: TableSortOptions = {
		name: new SortDisplayOption('Name', 'name', SortDirection.asc),
		username: new SortDisplayOption('Username', 'username', SortDirection.asc)
	};

	pagingOptions: PagingOptions;

	searchUsersRef: Observable<any>;

	private routeParamSubscription: Subscription;

	constructor(
		private modalService: ModalService,
		private router: Router,
		private route: ActivatedRoute,
		private teamsService: TeamsService,
		private userService: UserService,
		private authService: AuthenticationService,
		public alertService: AlertService
	) {}

	ngOnInit() {
		this.alertService.clearAllAlerts();

		this.user = this.authService.getCurrentUser();

		this.team = new Team();

		this.pagingOptions = new PagingOptions();
		this.pagingOptions.sortField = this.sortOptions['name'].sortField;
		this.pagingOptions.sortDir = this.sortOptions['name'].sortDir;

		this.routeParamSubscription = this.route.params.subscribe((params: Params) => {
			this.teamId = params[`id`];

			// Initialize team if appropriate
			if (this.teamId) {
				this.teamsService.get(this.teamId)
					.filter((team: Team) => null != team)
					.subscribe((team: Team) => {
						this.team = team;
						this.getTeamMembers();
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

	ngOnDestroy() {
		this.routeParamSubscription.unsubscribe();
	}

	typeaheadOnSelect(e: any) {
		this.queryUserObj = new TeamMember().setFromTeamMemberModel(this.team, e.item);
		this.addMember(this.queryUserObj);
		this.queryUserSearchTerm = '';
	}

	goToPage(event: any) {
		this.pagingOptions.update(event.pageNumber, event.pageSize);
		this.getTeamMembers();
	}

	setSort(sortOpt: SortDisplayOption) {
		this.pagingOptions.sortField = sortOpt.sortField;
		this.pagingOptions.sortDir = sortOpt.sortDir;

		this.getTeamMembers();
	}

	updateRole(member: TeamMember, role: string) {
		// No update required
		if (member.role === role) {
			return;
		}

		// If user is removing their own admin, verify that they know what they're doing
		if (this.user.userModel._id === member.userModel._id && member.role === 'admin' && role !== 'admin') {
			this.modalService
				.confirm(
					'Remove "Team Admin" role?',
					`Are you sure you want to remove <strong>yourself</strong> from the Team Admin role?<br/>Once you do this, you will no longer be able to manage the members of this team. <br/><strong>This also means you won\'t be able to give the role back to yourself.</strong>`,
					'Remove Admin')
				.first()
				.filter((action: ModalAction) => action === ModalAction.OK)
				.switchMap(() => this.doUpdateRole(member, role))
				.switchMap(() => this.authService.reloadCurrentUser())
				.subscribe(() => {
					// If we successfully removed the role from ourselves, redirect away
					this.router.navigate(['/teams', {clearCachedFilter: true}]);
				}, (error: HttpErrorResponse) => this.alertService.addClientErrorAlert(error));
		}
		else if (!member.explicit) {
			// Member is implicitly in team, should explicitly add this member with the desired role
			this.addMember(member, role);
		}
		else {
			this.doUpdateRole(member, role).subscribe(
			() => this.getTeamMembers(),
			(error: HttpErrorResponse) => this.alertService.addClientErrorAlert(error));
		}
	}

	removeMember(member: TeamMember) {
		this.modalService
			.confirm(
				'Remove member from team?',
				`Are you sure you want to remove member: "${member.userModel.name}" from this team?`,
				'Remove Member')
			.first()
			.filter((action: ModalAction) => action === ModalAction.OK)
			.switchMap(() => this.teamsService.removeMember(this.teamId, member.userModel._id))
			.switchMap(() => this.authService.reloadCurrentUser())
			.subscribe(
				() => this.getTeamMembers(),
				(error: HttpErrorResponse) => this.alertService.addClientErrorAlert(error));
	}

	private addMember(member: User, role?: string) {
		if (null == this.teamId || null == member) {
			this.alertService.addAlert('Failed to add member. Missing member or teamId.');
			return;
		}

		this.teamsService.addMember(this.teamId, member.userModel._id, role)
			.switchMap(() => this.authService.reloadCurrentUser())
			.subscribe(
				() => this.getTeamMembers(),
				(error: HttpErrorResponse) => this.alertService.addClientErrorAlert(error));
	}

	private getTeamMembers() {
		this.teamsService.searchMembers(this.teamId, this.team, null, null, this.pagingOptions, false).subscribe((result: IPagingResults) => {
			this.teamMembers = result.elements;
			if (this.teamMembers.length > 0) {
				this.pagingOptions.set(result.pageNumber, result.pageSize, result.totalPages, result.totalSize);
			}
			else {
				this.pagingOptions.reset();
			}
		});
	}

	private doUpdateRole(member: TeamMember, role: string): Observable<any> {
		return this.teamsService.updateMemberRole(this.teamId, member.userModel._id, role);
	}
}
