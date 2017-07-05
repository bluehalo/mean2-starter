import { NgModule, ApplicationModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { UtilModule } from 'app/shared';
import { CoreHelpModule, CoreHelpRoutingModule } from 'app/core';
import { TeamsHelpModule, TeamsHelpRoutingModule } from 'app/teams';

import { HelpComponent } from './help.component';
import { HelpRoutingModule } from './help-routing.module';
import { HelpService } from './help.service';

@NgModule({
	imports: [
		ApplicationModule,

		CoreHelpModule,
		CoreHelpRoutingModule,

		HelpRoutingModule,

		TeamsHelpModule,
		TeamsHelpRoutingModule,

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
