import { Credentials } from './credentials.class';

export class User {

	constructor(
		public userModel: any = {}, // raw User model object,
		public credentials: Credentials = new Credentials(),
		public eua?: any,
		public groups?: any,
		public isAdminOfAGroup?: boolean,
		public isEditorOfAGroup?: boolean) {
	}

	// General auth methods
	public isAuthenticated(): boolean {
		return (null != this.userModel && null != this.userModel.username);
	}
	public isEuaCurrent() {
		return (null == this.eua) || (null == this.eua.published) || (null != this.userModel.acceptedEua && this.userModel.acceptedEua >= this.eua.published);
	}
	public isActive(): boolean {
		return this.isAuthenticated() && (this.isAdmin() || (this.isEuaCurrent() && this.hasAnyRole()));
	}
	public hasRole(role: string): boolean {
		return (null != this.userModel) && (null != this.userModel.roles) && (this.userModel.roles[role]);
	}
	public hasAnyRole(): boolean {
		return (this.hasRole('user') || this.hasRole('auditor') || this.hasRole('editor') || this.hasRole('admin'));
	}
	public hasRoles(roles: string[]): boolean {
		return roles.reduce( (p: boolean, c: string) => p && this.hasRole(c), true);
	}

	public isAdmin(): boolean {
		return this.hasRole('admin');
	}
	public isNonAdmin(): boolean {
		return this.isAuthenticated() && this.isEuaCurrent() && !this.isAdmin();
	}
	public isGroupEditor(): boolean {
		return this.hasRole('editor');
	}
	public isAuditor(): boolean {
		return this.hasRole('auditor');
	}

	// Group roles
	public hasGroupRole(groupId: string, role: string): boolean {
		return (this.userModel) && (this.groups[groupId]) && (this.groups[groupId].roles) && (this.groups[groupId].roles[role]);
	}
	public hasGroupAdmin(groupId: string): boolean {
		return this.hasGroupRole(groupId, 'admin');
	}
	public hasGroupEdit(groupId: string): boolean {
		return this.hasGroupRole(groupId, 'editor');
	}
	public hasGroup(groupId: string): boolean {
		return null != this.groups[groupId] && null != this.groups[groupId]._id;
	}
	public editableGroups(): string[] {
		let groupIds: string[] = [];
		for (let groupId in this.groups) {
			if (this.hasGroupEdit(groupId)) {
				groupIds.push(groupId);
			}
		}
		return groupIds;
	}

	// Action-specific checks
	public canManageGroup(groupId: string): boolean {
		return this.hasGroupAdmin(groupId) || this.isAdmin();
	}
	public canManageGroups(): boolean {
		return this.isAdmin() || this.isGroupEditor() || this.isAdminOfAGroup;
	}
	public canCreateGroups(): boolean {
		return this.isAdmin() || this.isGroupEditor();
	}
	public hasEditableGroups(): boolean {
		return this.isEditorOfAGroup;
	}
	public canEditGroup(groupId: string): boolean {
		return this.isAdmin() || this.hasGroupEdit(groupId);
	}

	public setEua(eua: any) {
		this.eua = eua;
	}

	public clearUser() {
		this.userModel = {};
		this.credentials = new Credentials();
		this.eua = {};
		this.groups = {};
		this.isAdminOfAGroup = false;
		this.isEditorOfAGroup = false;
	}

	public setFromUserModel(userModel: any): User {
		if (null == userModel || null == userModel.username) {
			userModel = null;
		}

		let wasActive = this.isActive();

		this.userModel = userModel;
		this.groups = {};

		if (null != this.userModel) {
			// Search the groups to see if we're an admin of any
			if (null != this.userModel.groups) {

				let self: User = this;
				this.userModel.groups.forEach(function (group: any) {

					self.groups[group._id] = group;

					if (null != group.roles) {
						if (group.roles.admin) {
							self.isAdminOfAGroup = true;
						}
						if (group.roles.editor) {
							self.isEditorOfAGroup = true;
						}
					}
				});
			}
		}

		let isActive = this.isActive();

		// TODO: How do we emit events...
		// 	if (!wasActive && isActive) {
		// 		$rootScope.$broadcast('user:active', data);
		// 	}
		// 	else if (wasActive && !isActive) {
		// 		$rootScope.$broadcast('user:inactive', data);
		// 	}
		return this;
	}

}
