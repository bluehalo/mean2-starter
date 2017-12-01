import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';

import { ManageUserComponent } from './manage-user.component';
import { AdminService } from '../admin.service';
import { User } from '../user.class';
import { AuthenticationService } from '../authentication/authentication.service';
import { ConfigService } from '../../core/config.service';
import { AlertService } from '../../shared/alert.service';
import { CacheEntriesService } from '../../access-checker/cache-entries.service';

@Component({
	selector: 'edit-user',
	templateUrl: 'manage-user.component.html'
})
export class UpdateUserComponent extends ManageUserComponent {

	mode: string = 'edit';

	refreshing: boolean = false;

	constructor(
		private adminService: AdminService,
		private authService: AuthenticationService,
		private cacheEntriesService: CacheEntriesService,
		protected router: Router,
		protected configService: ConfigService,
		public alertService: AlertService
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

	submitUser(user: User): Observable<any> {
		return this.adminService.update(user).switchMap(() => this.authService.reloadCurrentUser());
	}

	/**
	 * Refresh the user's cache entry
	 */
	refreshCredentials() {
		this.refreshing = true;
		this.cacheEntriesService.refreshCurrentUser().switchMap(() => {
			this.alertService.addAlert('Credentials successfully refreshed', 'success');
			this.refreshing = false;
			return this.authService.signin(this.user);
		}).subscribe(
			() => this.initializeUser(),
			(error: HttpErrorResponse) => {
				this.refreshing = false;
				this.alertService.addAlert(error.error.message);
			}
		);
	}

	private initializeUser() {
		this.user = _.cloneDeep(this.authService.getCurrentUser());
		this.user.userModel.providerData = { dn: (null != this.user.userModel.providerData) ? this.user.userModel.providerData.dn : undefined };
	}
}
