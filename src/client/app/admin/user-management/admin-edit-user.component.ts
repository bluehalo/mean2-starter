import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

import { ConfigService } from 'app/core';
import { AlertService } from 'app/shared';

import { User } from '../user.class';
import { AdminService } from '../admin.service';
import { ManageUserComponent } from './manage-user.component';
import { Role } from '../user-management/role.class';

@Component({
	selector: 'admin-edit-user',
	templateUrl: './manage-user.component.html'
})
export class AdminUpdateUserComponent extends ManageUserComponent {

	private mode = 'admin-edit';

	private possibleRoles = Role.ROLES;

	private id: string;

	private sub: any;

	constructor(
		router: Router,
		configService: ConfigService,
		alertService: AlertService,
		private adminService: AdminService,
		private route: ActivatedRoute
	) {
		super(router, configService, alertService);
	}

	initialize() {
		this.sub = this.route.params.subscribe( (params: any) => {
			this.id = params.id;

			this.title = 'Edit User';
			this.subtitle = 'Make changes to the user\'s information';
			this.okButtonText = 'Save';
			this.navigateOnSuccess = '/admin/users';
			this.okDisabled = false;
			this.adminService.get(this.id).subscribe((userRaw: any) => {
				this.user = new User().setFromUserModel(userRaw);
				if (null == this.user.userModel.roles) {
					this.user.userModel.roles = {};
				}
				this.user.userModel.providerData = { dn: (null != this.user.userModel.providerData) ? this.user.userModel.providerData.dn : undefined };
				this.metadataLocked = this.proxyPki && !this.user.userModel.bypassAccessCheck;
			});
		});

	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	handleBypassAccessCheck() {
		// Don't need to do anything
	}

	submitUser(user: User) {
		return this.adminService.update(user);
	}

}
