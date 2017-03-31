import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from 'app/core/auth-guard.service';
import { TeamsHelpComponent } from './teams-help.component';
import { HelpComponent } from 'app/help/help.component';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: 'help',
				component: HelpComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'user' ] },
				children: [
					{
						path: 'teams',
						component: TeamsHelpComponent
					}
				]
			}])
	],
	exports: []
})
export class TeamsHelpRoutingModule {}
