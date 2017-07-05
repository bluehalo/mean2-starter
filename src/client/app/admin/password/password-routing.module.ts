import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from 'app/core';

import { ForgotPasswordComponent } from './forgot-password.component';
import { ResetPasswordComponent } from './reset-password.component';
import { ResetPasswordSuccessComponent } from './reset-password-success.component';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: 'password/forgot',
				canActivate: [AuthGuard],
				component: ForgotPasswordComponent,
				data: {
					requiresAuthentication: false,
					roles: []
				}
			},
			{
				path: 'password/reset/:token',
				canActivate: [AuthGuard],
				component: ResetPasswordComponent,
				data: {
					requiresAuthentication: false,
					roles: []
				}
			},
			{
				path: 'password/reset-success',
				canActivate: [AuthGuard],
				component: ResetPasswordSuccessComponent,
				data: {
					requiresAuthentication: false,
					roles: []
				}
			}])
	],
	exports: [
		RouterModule
	]
})
export class PasswordRoutingModule { }
