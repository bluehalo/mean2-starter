import * as _ from 'lodash';
import {Injectable} from "@angular/core";
import {Response} from "@angular/http";
import {AsyHttp, HttpOptions} from "../../../util/client/services/asy-http.client.service";
import {AuthenticationService} from "../../../users/client/services/authentication.client.service";
import {User} from "../../../users/client/model/user.client.class";
import {Observable} from "rxjs/Observable";
import {PagingOptions} from "../../../util/client/components/pager.client.component";

export class TeamMember extends User {

	public explicit: boolean = false;

	public active: boolean = false;

	public role: string = 'member';

	constructor() {
		super();
	}

	public getRoleInTeam(team: Team): string {
		// Find the role of this user in the team
		let ndx = _.findIndex(this.userModel.teams, function(t: any) {
			return t._id === team._id;
		});

		if (-1 !== ndx) {
			return this.userModel.teams[ndx].role;
		}

		return null;
	}

	public isTeamAdmin(team: Team): boolean {
		return (this.getRoleInTeam(team) === 'admin');
	}

	public isTeamEditor(team: Team): boolean {
		return (this.getRoleInTeam(team) === 'editor');
	}

	public isTeamMember(team: Team): boolean {
		return (this.getRoleInTeam(team) === 'member');
	}

	public canManageTeam(team: Team): boolean {
		return (this.isAdmin() || this.isTeamAdmin(team));
	}

	public canManageTeamResources(team: Team): boolean {
		return (this.isAdmin() || this.isTeamAdmin(team) || this.isTeamEditor(team));
	}

	public canViewTeamResources(team: Team): boolean {
		return (this.isAdmin() || this.isTeamAdmin(team) || this.isTeamEditor(team) || this.isTeamMember(team));
	}

	public setFromTeamMemberModel(team: Team, userModel: any): TeamMember {
		// Set the user model
		super.setFromUserModel(userModel);

		// Initialize the teams array if needed
		if (null == userModel.teams) {
			this.userModel.teams = [];
		}
		else if (null != team) {
			this.role = this.getRoleInTeam(team);
		}

		// Determine if user is implicit/explicit and active/inactive
		this.explicit = (null != userModel.teams && userModel.teams.length > 0);

		if (userModel.bypassAccessCheck) {
			this.active = true;
		}
		else if (null != team) {
			this.active = (0 === _.difference(team.requiresExternalTeams, userModel.externalGroups).length);
		}

		return this;
	}
}

export class Team {
	constructor(
		public _id?: string,
		public name?: string,
		public description?: string,
		public created?: number,
		public requiresExternalTeams?: string[]
	) {
		this.requiresExternalTeams = (_.isUndefined(requiresExternalTeams)) ? [] : requiresExternalTeams;
	}
}

export class TeamRole {
	constructor(
		public label: string,
		public description: string,
		public role: string
	) {}

	public static get ROLES(): TeamRole[] {
		return [
			new TeamRole('Member', 'This user can view projects within this team.', 'member'),
			new TeamRole('Editor', 'This user has member privileges and can also create and manage projects within this team', 'editor'),
			new TeamRole('Admin', 'This user has editor privileges and can also manage team membership', 'admin')
		]
	}

}

@Injectable()
export class TeamsService {

	public cache : any = {};

	constructor(
		private asyHttp: AsyHttp,
		private auth: AuthenticationService
	) {
	}

	public search(query: any, search: any, paging: PagingOptions, options: any): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('teams?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { s: search , q: query, options: options }));
	}

	// Retrieve all teams (or up to 1000)
	public selectionList(): Observable<Response> {
		return this.search({}, null, new PagingOptions(0, 1000), {});
	}

	public get(teamId: string): Observable<Response> {
		return this.asyHttp.get(new HttpOptions('team/' + teamId, () => {}));
	}

	public searchMembers(teamId: string, query: any, search: any, paging: PagingOptions): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('team/' + teamId + '/members?' + this.asyHttp.urlEncode(paging.toObj()), () => {}, { s: search , q: query }));
	}

	public create(team: Team): Observable<Response> {
		return this.asyHttp.put(new HttpOptions('team', () => { }, team));
	}

	public update(team: Team): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('team/' + team._id, () => {}, team));
	}

	public delete(teamId: string): Observable<Response> {
		return this.asyHttp.delete(new HttpOptions('team/' + teamId, () => {}));
	}

	public addMember(teamId: string, memberId: string, role?: string): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('team/' + teamId + '/member/' + memberId, () => {}, { role: role }));
	}

	public updateMemberRole(teamId: string, memberId: string, role: string): Observable<Response> {
		return this.asyHttp.post(new HttpOptions('team/' + teamId + '/member/' + memberId + '/role', () => {}, { role: role }));
	}

	public removeMember(teamId: string, memberId: string): Observable<Response> {
		return this.asyHttp.delete(new HttpOptions('team/' + teamId + '/member/' + memberId, () => {}, {}));
	}

	public getTeamsCanManageResources(user: TeamMember): Observable<Team[]> {
		return Observable.create(observer => {
			this.selectionList().subscribe((result: any) => {
				let teams: Team[] = [];
				if (null != result && null != result.elements && result.elements.length > 0) {
					teams = result.elements.map(e => new Team(e._id, e.name, e.description, e.created, e.requiresExternalTeams));
				}
				observer.next(teams.filter(team => user.canManageTeamResources(team)));
			},
				err => { observer.error(err); },
				() => { observer.complete(); }
			);
		});
	}

}

