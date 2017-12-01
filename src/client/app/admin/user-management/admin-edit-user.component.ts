import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { User } from '../user.class';
import { AdminService } from '../admin.service';
import { ManageUserComponent } from './manage-user.component';
import { Role } from './role.class';
import { ConfigService } from '../../core/config.service';
import { AlertService } from '../../shared/alert.service';

@Component({
	selector: 'admin-edit-user',
	templateUrl: 'manage-user.component.html'
})
export class AdminUpdateUserComponent extends ManageUserComponent {

	mode = 'admin-edit';

	possibleRoles = Role.ROLES;

	private id: string;

	private sub: any;

	constructor(
		private adminService: AdminService,
		private route: ActivatedRoute,
		protected router: Router,
		protected configService: ConfigService,
		public alertService: AlertService
	) {
		super(router, configService, alertService);
	}

	initialize() {
		this.sub = this.route.params
			.do( (params: Params) => {
				this.id = params.id;

				this.title = 'Edit User';
				this.subtitle = 'Make changes to the user\'s information';
				this.okButtonText = 'Save';
				this.navigateOnSuccess = '/admin/users';
				this.okDisabled = false;
			})
			.switchMap(() => this.adminService.get(this.id))
			.subscribe((user: User) => {
				this.user = user;
				if (null == this.user.userModel.roles) {
					this.user.userModel.roles = {};
				}
				this.user.userModel.providerData = { dn: (null != this.user.userModel.providerData) ? this.user.userModel.providerData.dn : undefined };
				this.metadataLocked = this.proxyPki && !this.user.userModel.bypassAccessCheck;
			});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	handleBypassAccessCheck() {
		// Don't need to do anything
	}

	submitUser(user: User): Observable<any> {
		return this.adminService.update(user);
	}

}
