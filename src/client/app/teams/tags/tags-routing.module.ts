import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from 'app/core/auth-guard.service';
import { ManageTagComponent } from './manage-tag.component';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: 'tag/create',
				component: ManageTagComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'user' ] }
			},
			{
				path: 'tag/edit/:id',
				component: ManageTagComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'user' ] }
			}
		])
	],
	exports: [
		RouterModule
	]
})
export class TagsRoutingModule { }
