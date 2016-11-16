import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../services/auth-guard.service';
import { OverviewHelpComponent } from './overview.client.component';
import { HelpComponent, AboutComponent } from '../../help/components/help.client.component';

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
						path: 'about',
						component: AboutComponent,
						canActivate: [AuthGuard],
						data: { roles: [ 'user' ] },
					},
					{
						path: 'overview',
						component: OverviewHelpComponent,
						canActivate: [AuthGuard],
						data: { roles: [ 'user' ] },
					}
				]
			}])
	],
	exports: []
})
export class CoreHelpRoutingModule {}
