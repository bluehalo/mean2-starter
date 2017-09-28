import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AdminComponent } from '../../../admin/admin.component';
import { AuthGuard } from '../../auth-guard.service';
import { ListFeedbackComponent } from './list-feedback.component';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: 'admin',
				component: AdminComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'admin' ] },
				children: [
					{
						path: 'feedback',
						component: ListFeedbackComponent
					}
				]
			}])
	],
	exports: []
})
export class AdminFeedbackRoutingModule {}
