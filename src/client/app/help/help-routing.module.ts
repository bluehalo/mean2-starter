import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HelpComponent } from './help.component';
import { AuthGuard } from '../core/auth-guard.service';

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
					}
				]
			}])
	],
	exports: [
	]
})
export class HelpRoutingModule { }
