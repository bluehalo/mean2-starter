import { NgModule, ApplicationModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { HelpComponent } from './help.component';
import { HelpRoutingModule } from './help-routes.module';
import { UtilModule } from '../shared/util.module';
import { CoreHelpModule } from '../core/help/core-help.module';
import { CoreHelpRoutingModule } from '../core/help/core-help-routes.module';
import { HelpService } from './help.service';

@NgModule({
	imports: [
		ApplicationModule,

		CoreHelpModule,
		CoreHelpRoutingModule,

		HelpRoutingModule,

		CommonModule,
		FormsModule,
		RouterModule,
		Ng2BootstrapModule,
		UtilModule
	],
	exports: [],
	declarations:   [
		HelpComponent
	],
	providers:  [
		HelpService
	]
})
export class HelpModule { }
