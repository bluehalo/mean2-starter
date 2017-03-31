import { Component } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { ConfigService } from 'app/core';
import { AlertService } from 'app/shared';
import { CacheEntriesService } from 'app/access-checker';

import { AuthenticationService } from '../authentication';
import { ManageUserComponent } from './manage-user.component';
import { AdminService } from '../admin.service';
import { User } from '../user.class';

@Component({
	selector: 'edit-user',
	templateUrl: './manage-user.component.html'
})
export class UpdateUserComponent extends ManageUserComponent {

	mode: string = 'edit';
	refreshing: boolean = false;

	constructor(
		router: Router,
		configService: ConfigService,
		alertService: AlertService,
		private adminService: AdminService,
		private authService: AuthenticationService,
		private cacheEntriesService: CacheEntriesService
	) {
		super(router, configService, alertService);
	}


	initialize() {
		this.title = 'Edit Profile';
		this.subtitle = 'Make changes to your profile information';
		this.okButtonText = 'Save';
		this.initializeUser();
		this.navigateOnSuccess = '/';
		this.metadataLocked = this.proxyPki && !this.user.userModel.bypassAccessCheck;
		this.okDisabled = this.proxyPki && !this.user.userModel.bypassAccessCheck;
	}

	handleBypassAccessCheck() {
		this.okDisabled = null != this.user && !this.user.userModel.bypassAccessCheck;
	}

	submitUser(user: User): any {
		let updateResult = this.adminService.update(user);
		updateResult.subscribe(() => this.authService.reloadCurrentUser());
		return updateResult;
	}

	/**
	 * Refresh the user's cache entry
	 */
	refreshCredentials() {
		this.refreshing = true;
		this.cacheEntriesService.refreshCurrentUser().subscribe(
			() => {
				this.alertService.addAlert('Credentials successfully refreshed', 'success');
				this.refreshing = false;
				this.authService.signin(this.user).subscribe(
					() => this.initializeUser(),
					(response: Response) => { this.alertService.addAlert(response.json().message); }
				);
			},
			(response: Response) => {
				this.alertService.addAlert(response.json().message);
				this.refreshing = false;
			}
		);
	};

	private initializeUser() {
		this.user = _.cloneDeep(this.authService.getCurrentUser());
		this.user.userModel.providerData = { dn: (null != this.user.userModel.providerData) ? this.user.userModel.providerData.dn : undefined };
	}

}
