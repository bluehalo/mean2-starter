import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

import { AdminListUsersComponent } from './components/admin-list-users.client.component';
import { AdminCreateUserComponent } from './components/user-management/admin-create-user.client.component';
import { AdminUpdateUserComponent } from './components/user-management/admin-edit-user.client.component';
import { AdminComponent } from './components/admin.client.component';
import { AdminListEuasComponent } from './components/end-user-agreement/admin-list-euas.client.component';
import { AdminCreateEuaComponent } from './components/end-user-agreement/admin-create-eua.client.component';
import { AdminUpdateEuaComponent } from './components/end-user-agreement/admin-edit-eua.client.component';
import { AdminCacheEntriesComponent } from '../access-checker/components/admin-cache-entries.client.component';
import { AuthGuard } from '../core/services/auth-guard.service';

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
