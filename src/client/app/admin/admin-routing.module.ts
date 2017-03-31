import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AdminListUsersComponent } from './user-management/admin-list-users.component';
import { AdminCreateUserComponent } from './user-management/admin-create-user.component';
import { AdminUpdateUserComponent } from './user-management/admin-edit-user.component';
import { AdminComponent } from './admin.component';
import { AdminListEuasComponent } from './end-user-agreement/admin-list-euas.component';
import { AdminCreateEuaComponent } from './end-user-agreement/admin-create-eua.component';
import { AdminUpdateEuaComponent } from './end-user-agreement/admin-edit-eua.component';
import { AdminCacheEntriesComponent } from '../access-checker/admin-cache-entries.component';
import { AuthGuard } from 'app/core/auth-guard.service';

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
