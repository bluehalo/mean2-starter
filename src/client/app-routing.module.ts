import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './core/services/auth-guard.service';
import { SigninComponent } from './admin/components/signin.client.component';
import { UnauthorizedComponent } from './admin/components/unauthorized.client.component';
import { UserSignupComponent } from './admin/components/user-management/user-signup.client.component';
import { UpdateUserComponent } from './admin/components/user-management/edit-user.client.component';
import { InvalidResourceComponent } from './core/components/invalid-resource.client.component';
import { InvalidCertificateComponent } from './admin/components/invalid-certificate.client.component';
import { AuditComponent } from './audit/components/audit.client.component';
import { UserEuaComponent } from './admin/components/end-user-agreement/user-eua.client.component';
import { NoAccessComponent } from './admin/components/no-access.client.component';
import { LoggedInComponent } from './core/components/logged-in.client.component';
import { InactiveComponent } from './admin/components/inactive.client.component';

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
	exports: [RouterModule]
})

export class AppRoutingModule {}
