import {Component, forwardRef, Inject, ViewContainerRef} from '@angular/core';
import {Response} from "@angular/http";
import {ROUTER_DIRECTIVES, Router, RouteParams} from "@angular/router-deprecated";
import {Modal} from "angular2-modal/plugins/bootstrap";
import {AlertComponent, TAB_DIRECTIVES} from "ng2-bootstrap/ng2-bootstrap";
import {Observable} from "rxjs/Observable";
import {ListTeamMembersComponent} from "./list-team-members.client.component"
import {ListProjectsComponent} from '../../../projects/client/components/list-projects.client.component';
import {AsyRouteMappings} from "../../../util/client/util/AsyRouteMappings.client.class";
import {AgoDatePipe} from "../../../util/client/pipes/ago-date.client.pipe";
import {Team, TeamMember, TeamsService} from "../services/teams.client.service";
import {AuthenticationService} from "../../../users/client/services/authentication.client.service";
import {PagingOptions, Pager} from "../../../util/client/components/pager.client.component";
import {AlertService} from "../../../util/client/services/alert.client.service";
import {SortDirection, SortDisplayOption} from "../../../util/client/util/result-utils.client.classes";
import {InLineEdit} from "../../../util/client/components/in-line-edit.client.component";

@Component({
	selector: 'team-summary',
	templateUrl: 'app/teams/views/team-summary.client.view.html',
	directives: [AlertComponent, InLineEdit, ListTeamMembersComponent, ListProjectsComponent, Pager, TAB_DIRECTIVES, ROUTER_DIRECTIVES],
	pipes: [AgoDatePipe]
})
export class TeamSummaryComponent {

	private user: TeamMember;

	private team: Team;

	private teamId: string;

	private defaultDescription: string = 'No Description.';

	constructor(
		private router: Router,
		private modal: Modal,
		private viewContainer: ViewContainerRef,
		private routeParams: RouteParams,
		private teamsService: TeamsService,
		public alertService: AlertService,
		public auth: AuthenticationService,
		@Inject(forwardRef(() => AsyRouteMappings)) protected asyRoutes
	) {
		this.modal.defaultViewContainer = viewContainer;
	}

	ngOnInit() {
		this.user = new TeamMember().setFromTeamMemberModel(null, this.auth.getCurrentUser().userModel);

		this.team = new Team();
		this.teamId = this.routeParams.get('id');

		// Initialize team
		if (this.teamId) {
			this.teamsService.get(this.teamId)
				.subscribe((result: any) => {
					if (null != result) {
						this.team = new Team(result._id, result.name, result.description, result.created, result.requiresExternalTeams);
						if (_.isEmpty(this.team.description)) {
							this.team.description = this.defaultDescription;
						}
					}
					else {
						this.router.navigate([this.asyRoutes.getPath('InvalidResource'), {type: 'team'}]);
					}
				},
				err => {
					this.router.navigate([this.asyRoutes.getPath('InvalidResource'), {type: 'team'}]);
				});
		}
	}

	private saveEditable(val) {
		if (val.hasOwnProperty('name')) {
			this.team.name = val.name;
		}

		if (val.hasOwnProperty('description')) {
			this.team.description = val.description;
		}

		this.teamsService.update(this.team)
			.subscribe(
				(result:any) => {
					if (null != result) {
						this.team = new Team(result._id, result.name, result.description, result.created, result.requiresExternalTeams);

						if (_.isEmpty(this.team.description)) {
							this.team.description = this.defaultDescription;
						}
					}
				},
				err => {
					console.log(err);
				});
	}

	private remove() {
		this.modal.confirm()
			.size('lg')
			.showClose(true)
			.isBlocking(true)
			.title('Delete team?')
			.body(`Are you sure you want to delete the team: <strong>"${this.team.name}"</strong>?<br/>This action cannot be undone.`)
			.okBtn('Delete')
			.open()
			.then(
				resultPromise => resultPromise.result.then(
					() => {
						this.teamsService.delete(this.team._id)
							.subscribe(() => {
									this.auth.reloadCurrentUser().subscribe(() => {
										this.router.navigate([this.asyRoutes.getPath('Teams')]);
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
