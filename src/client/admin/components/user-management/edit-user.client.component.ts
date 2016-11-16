import { Component } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';

import { ManageUserComponent } from './manage-user.client.component';
import { AdminService } from '../../services/admin.client.service';
import { User } from '../../model/user.client.class';
import { AuthenticationService } from '../../services/authentication.client.service';
import * as _ from 'lodash';
import { ConfigService } from '../../../core/services/config.client.service';
import { AlertService } from '../../../shared/services/alert.client.service';
import { CacheEntriesService } from '../../../access-checker/services/cache-entries.client.service';

@Component({
	selector: 'edit-user',
	templateUrl: '../../views/manage-user.client.view.html'
})
export class UpdateUserComponent extends ManageUserComponent {

	private mode: string = 'edit';
	private refreshing: boolean = false;

	constructor(
		router: Router,
		configService: ConfigService,
		alertService: AlertService,
		private adminService: AdminService,
		private authService: AuthenticationService,
		private route: ActivatedRoute,
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
	private refreshCredentials() {
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
