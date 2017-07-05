import { NgModule } from '@angular/core';

import { OverviewHelpComponent } from './overview.component';
import { AboutComponent } from '../about.component';
import { HelpService } from 'app/help/help.service';
import { HelpTopic } from 'app/help/help.class';


@NgModule({
	imports: [],
	exports: [],
	declarations:   [
		AboutComponent,
		OverviewHelpComponent
	],
	providers:  []
})
export class CoreHelpModule {
	constructor(private helpService: HelpService) {
		this.helpService.registerHelpComponent(new HelpTopic('Getting Started', 'overview', 'core'));
	}
}
