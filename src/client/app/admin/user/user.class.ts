import { Credentials } from '../authentication/credentials.class';

export class User {
	userModel: any = {}; // raw User model object,
	credentials: Credentials = new Credentials();
	eua?: any;

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
		return (null != this.userModel) && (null != this.userModel.roles) && (null != this.userModel.roles[role]) && (this.userModel.roles[role]);
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
	public isEditor(): boolean {
		return this.hasRole('editor');
	}
	public isAuditor(): boolean {
		return this.hasRole('auditor');
	}
	public canManageSystemResources(): boolean {
		return this.isAdmin() || this.isEditor();
	}

	public setEua(eua: any) {
		this.eua = eua;
	}

	public clearUser() {
		this.userModel = {};
		this.credentials = new Credentials();
		this.eua = {};
	}

	public setFromUserModel(userModel: any): User {
		if (null == userModel || null == userModel.username) {
			userModel = null;
		}

		this.userModel = userModel;

		return this;
	}

}
