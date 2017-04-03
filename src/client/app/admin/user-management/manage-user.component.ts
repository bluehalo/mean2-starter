import { Router } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs';

import { ConfigService } from 'app/core';
import { AlertService } from 'app/shared';
import { User } from '../user';

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
		private router: Router,
		private configService: ConfigService,
		public alertService: AlertService
	) {
	}

	ngOnInit() {
		this.configService.getConfig()
			.subscribe((config: any) => {
				this.config = config;
				this.proxyPki = config.auth === 'proxy-pki';

				this.metadataLocked = this.proxyPki;

				this.initialize();
			});
	}

	abstract initialize(): any;

	abstract submitUser(user: User): Observable<Response>;

	abstract handleBypassAccessCheck(): any;

	submit() {
		if (this.validatePassword()) {
			this.submitUser(this.user)
				.subscribe(
					() => this.router.navigate([this.navigateOnSuccess]),
					(response: Response) => {
						if (response.status >= 400 && response.status < 500) {
							let errors = response.json().message.split('\n');
							this.error = errors.join(', ');
						}
					});
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
