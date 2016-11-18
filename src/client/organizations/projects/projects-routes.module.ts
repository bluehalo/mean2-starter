import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from '../core/auth-guard.service';
import { ManageProjectComponent } from './manage-project.component';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: 'project/create',
				component: ManageProjectComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'user' ] }
			},
			{
				path: 'project/edit/:id',
				component: ManageProjectComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'user' ] }
			}
		])
	],
	exports: [
	]
})
export class ProjectsRoutingModule { }
