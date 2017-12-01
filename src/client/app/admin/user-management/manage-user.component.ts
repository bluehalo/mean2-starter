import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { ConfigService } from '../../core/config.service';
import { AlertService } from '../../shared/alert.service';
import { User } from '../user.class';

export abstract class ManageUserComponent {

	config: any;

	error: string = null;

	proxyPki: boolean;

	metadataLocked: boolean;

	okDisabled: boolean;

	// Variables that will be set by implementing classes
	title: string;

	subtitle: string;

	okButtonText: string;

	navigateOnSuccess: string;

	user: User;

	constructor(
		protected router: Router,
		protected configService: ConfigService,
		public alertService: AlertService
	) {}

	ngOnInit() {
		this.configService.getConfig().first().subscribe((config: any) => {
			this.config = config;
			this.proxyPki = config.auth === 'proxy-pki';
			this.metadataLocked = this.proxyPki;
			this.initialize();
		});
	}

	abstract initialize(): any;

	abstract submitUser(user: User): Observable<any>;

	abstract handleBypassAccessCheck(): any;

	submit() {
		if (this.validatePassword()) {
			this.submitUser(this.user).subscribe(
				() => this.router.navigate([this.navigateOnSuccess]),
				(error: HttpErrorResponse) => this.alertService.addClientErrorAlert(error));
		}
	}

	bypassAccessCheck() {
		this.metadataLocked = null != (this.user) && !this.user.userModel.bypassAccessCheck;
		this.handleBypassAccessCheck();
	}

	private validatePassword(): boolean {
		if (this.user.userModel.password === this.user.userModel.verifyPassword) {
			return true;
		}
		this.error = 'Passwords must match';
		return false;
	}
}
