import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from '../core/auth-guard.service';
import { WelcomeComponent } from './welcome.component';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: 'welcome',
				component: WelcomeComponent,
				canActivate: [AuthGuard],
				data: { roles: [ 'user' ] }
			}])
	],
	exports: []
})
export class WelcomeRoutingModule { }
