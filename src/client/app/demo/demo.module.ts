import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SentioModule } from '@asymmetrik/angular2-sentio';

import { DemoRoutingModule } from './demo-routing.module';
import { DemoComponent } from './demo.component';

import { DemoLeafletComponent } from './leaflet/demo-leaflet.component';
import { DemoSentioComponent } from './sentio/demo-sentio.component';

@NgModule({
	imports: [
		SentioModule,
		DemoRoutingModule,

		CommonModule
	],
	exports: [],
	declarations: [
		DemoComponent,

		DemoLeafletComponent,
		DemoSentioComponent
	],
	providers: [
	]
})
export class DemoModule { }