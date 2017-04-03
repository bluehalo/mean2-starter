import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from 'app/core';

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
