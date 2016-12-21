import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from '../core/auth-guard.service';

import { DemoComponent } from './demo.component';
import { DemoLeafletComponent } from './leaflet/demo-leaflet.component';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: 'demo',
				component: DemoComponent,
				canActivate: [AuthGuard],
				data: { roles: [ ] },
				children: [
					/**
					 * Default Route
					 */
					{
						path: '',
						redirectTo: '/demo/leaflet',
						pathMatch: 'full'
					},

					/**
					 * Routes for specific demos
					 */
					{
						path: 'leaflet',
						component: DemoLeafletComponent
					}

				]
			}])
	],
	exports: [
		RouterModule
	]
})
export class DemoRoutingModule { }
