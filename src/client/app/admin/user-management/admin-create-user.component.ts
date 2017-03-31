import { Router } from '@angular/router';
import { Component } from '@angular/core';

import { ManageUserComponent } from './manage-user.component';
import { AdminService } from '../admin.service';
import { User } from '../user.class';
import { Role } from '../user-management/role.class';
import { ConfigService } from 'app/core/config.service';
import { AlertService } from 'app/shared/alert.service';

@Component({
	selector: 'admin-create-user',
	templateUrl: './manage-user.component.html'
})
export class AdminCreateUserComponent extends ManageUserComponent {

	private mode = 'admin-create';

	private possibleRoles = Role.ROLES;

	constructor(
		router: Router,
		configService: ConfigService,
		alertService: AlertService,
		private adminService: AdminService
	) {
		super(router, configService, alertService);
	}

	initialize() {
		this.title = 'Create User';
		this.subtitle = 'Provide the required information to create a new user';
		this.okButtonText = 'Create';
		this.navigateOnSuccess = '/admin/users';
		this.user = new User();
		this.user.userModel.roles = {};
	}

	handleBypassAccessCheck() {
		// Don't need to do anything
	}

	submitUser(user: User) {
		return this.adminService.create(user);
	}

}
