import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from '../auth-guard.service';
import { OverviewHelpComponent } from './overview.component';
import { HelpComponent } from '../../help/help.component';
import { AboutComponent } from '../about.component';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: 'help',
				component: HelpComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'user' ] },
				children: [
					/**
					 * Default Route
					 */
					{
						path: '',
						redirectTo: 'overview',
						pathMatch: 'full'
					},
					{
						path: 'overview',
						component: OverviewHelpComponent
					}
				]
			},
			{
				path: 'about',
				component: AboutComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'user' ] }
			}
		])
	],
	exports: []
})
export class CoreHelpRoutingModule {}
