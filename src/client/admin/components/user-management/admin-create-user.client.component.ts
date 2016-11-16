import { Router } from '@angular/router';
import { Component } from '@angular/core';

import { ManageUserComponent } from './manage-user.client.component';
import { AdminService } from '../../services/admin.client.service';
import { User } from '../../model/user.client.class';
import { Role } from '../../model/role.client.class';
import { ConfigService } from '../../../core/services/config.client.service';
import { AlertService } from '../../../shared/services/alert.client.service';

@Component({
	selector: 'admin-create-user',
	templateUrl: '../../views/manage-user.client.view.html'
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
