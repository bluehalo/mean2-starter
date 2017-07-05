import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from 'app/core';
import { AdminCacheEntriesComponent } from 'app/access-checker';

import {
	AdminListUsersComponent,
	AdminCreateUserComponent,
	AdminUpdateUserComponent,
} from './user-management';
import {
	AdminListEuasComponent,
	AdminCreateEuaComponent,
	AdminUpdateEuaComponent,
} from './end-user-agreement';

import { AdminComponent } from './admin.component';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: 'admin',
				component: AdminComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'admin' ] },
				children: [
					/**
					 * Default Route
					 */
					{
						path: '',
						redirectTo: '/admin/users',
						pathMatch: 'full'
					},

					/**
					 * Admin User Routes
					 */
					{
						path: 'users',
						component: AdminListUsersComponent
					},
					{
						path: 'user',
						component: AdminCreateUserComponent
					},
					{
						path: 'user/:id',
						component: AdminUpdateUserComponent
					},

					/**
					 * Admin Access Checker Route
					 */
					{
						path: 'cacheEntries',
						component: AdminCacheEntriesComponent
					},

					/**
					 * Admin EUA Routes
					 */
					{
						path: 'euas',
						component: AdminListEuasComponent
					},
					{
						path: 'eua',
						component: AdminCreateEuaComponent
					},
					{
						path: 'eua/:id',
						component: AdminUpdateEuaComponent
					}
				]
			}])
	],
	exports: [
		RouterModule
	]
})
export class AdminRoutingModule { }
