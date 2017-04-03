import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard, LoggedInComponent, InvalidResourceComponent } from './core';
import { AuditComponent } from './audit';

import {
	SigninComponent,
	UnauthorizedComponent,
	UserSignupComponent,
	UpdateUserComponent,
	InvalidCertificateComponent,
	UserEuaComponent,
	NoAccessComponent,
	InactiveComponent
} from './admin';

@NgModule({
	imports: [
		RouterModule.forRoot(
			[
				{
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
				}
			]
		, {
			useHash: true
		})
	],
	exports: [
		RouterModule
	]
})

export class AppRoutingModule {}
