import { NgModule } from '@angular/core';

import { AccordionModule } from 'ngx-bootstrap';

import { OverviewHelpComponent } from './overview.component';
import { AboutComponent } from '../about.component';
import { HelpService } from '../../help/help.service';
import { HelpTopic } from '../../help/help.class';


@NgModule({
	imports: [
		AccordionModule.forRoot()
	],
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
