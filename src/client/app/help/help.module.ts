import { NgModule, ApplicationModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { HelpComponent } from './help.component';
import { HelpRoutingModule } from './help-routing.module';
import { UtilModule } from 'app/shared/util.module';
import { CoreHelpModule } from 'app/core/help/core-help.module';
import { CoreHelpRoutingModule } from 'app/core/help/core-help-routing.module';
import { TeamsHelpModule } from 'app/teams/help/teams-help.module';
import { TeamsHelpRoutingModule } from 'app/teams/help/teams-help-routing.module';
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
