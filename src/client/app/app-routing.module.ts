import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from './core/auth-guard.service';
import { SigninComponent } from './admin/authentication/signin.component';
import { UnauthorizedComponent } from './admin/authentication/unauthorized.component';
import { UserSignupComponent } from './admin/user-management/user-signup.component';
import { UpdateUserComponent } from './admin/user-management/edit-user.component';
import { InvalidResourceComponent } from './core/invalid-resource.component';
import { InvalidCertificateComponent } from './admin/authentication/invalid-certificate.component';
import { AuditComponent } from './audit/components/audit.client.component';
import { UserEuaComponent } from './admin/end-user-agreement/user-eua.component';
import { NoAccessComponent } from './admin/authentication/no-access.component';
import { LoggedInComponent } from './core/logged-in.component';
import { InactiveComponent } from './admin/authentication/inactive.component';

@NgModule({
	imports: [
		RouterModule.forRoot(
			[{
				// map '/' to default route
				path: '',
				canActivate: [AuthGuard],
				redirectTo: '/logged-in',
				pathMatch: 'full'
			},
			{
				path: 'signin',
				component: SigninComponent,
				canActivate: [AuthGuard],
				data: {
					requiresAuthentication: false,
					roles: []
				}
			},
			{
				path: 'unauthorized',
				component: UnauthorizedComponent,
				canActivate: [AuthGuard],
				data: {
					requiresAuthentication: false,
					roles: []
				}
			},
			{
				path: 'signup',
				component: UserSignupComponent,
				canActivate: [AuthGuard],
				data: {
					requiresAuthentication: false,
					roles: []
				}
			},
			{
				path: 'update-user',
				canActivate: [AuthGuard],
				component: UpdateUserComponent
			},
			{
				path: 'resource/invalid',
				canActivate: [AuthGuard],
				component: InvalidResourceComponent,
				data: {
					requiresAuthentication: false,
					roles: []
				}
			},
			{
				path: 'invalid-certificate',
				canActivate: [AuthGuard],
				component: InvalidCertificateComponent,
				data: {
					requiresAuthentication: false,
					roles: []
				}
			},
			{
				path: 'audit',
				canActivate: [AuthGuard],
				component: AuditComponent,
				data: {
					roles: ['auditor']
				}
			},
			{
				path: 'user-eua',
				canActivate: [AuthGuard],
				component: UserEuaComponent
			},
			{
				path: 'no-access',
				canActivate: [AuthGuard],
				component: NoAccessComponent,
				data: {
					requiresAuthentication: false
				}
			},
			{
				path: 'logged-in',
				canActivate: [AuthGuard],
				component: LoggedInComponent
			},
			{
				path: 'inactive-user',
				canActivate: [AuthGuard],
				component: InactiveComponent
			}]
		, {
			useHash: true
		})
	],
	exports: [
		RouterModule
	]
})

export class AppRoutingModule {}
