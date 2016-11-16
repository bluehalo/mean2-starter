import { Router } from '@angular/router';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';

import { ConfigService } from '../../../core/services/config.client.service';
import { AlertService } from '../../../shared/services/alert.client.service';
import { User } from '../../model/user.client.class';

export abstract class ManageUserComponent {

	protected config: any;
	protected error: string = null;
	protected proxyPki: boolean;
	protected metadataLocked: boolean;
	protected okDisabled: boolean;

	// Variables that will be set by implementing classes
	protected title: string;
	protected subtitle: string;
	protected okButtonText: string;
	protected navigateOnSuccess: string;
	protected user: User;

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

	private validatePassword(): boolean {
		if (this.user.userModel.password === this.user.userModel.verifyPassword) {
			return true;
		}
		this.error = 'Passwords must match';
		return false;
	}

	private bypassAccessCheck() {
		this.metadataLocked = null != (this.user) && !this.user.userModel.bypassAccessCheck;
		this.handleBypassAccessCheck();
	}

	private submit() {
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

}
