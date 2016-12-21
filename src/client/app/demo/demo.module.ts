import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DemoRoutingModule } from './demo-routing.module';
import { DemoComponent } from './demo.component';

import { DemoLeafletComponent } from './leaflet/demo-leaflet.component';

@NgModule({
	imports: [
		DemoRoutingModule,

		CommonModule
	],
	exports: [],
	declarations: [
		DemoComponent,

		DemoLeafletComponent
	],
	providers: [
	]
})
export class DemoModule { }
