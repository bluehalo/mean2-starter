import * as _ from 'lodash';

import { User } from '../admin/user.class';

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
