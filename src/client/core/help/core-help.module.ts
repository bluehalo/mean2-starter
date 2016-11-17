import { NgModule } from '@angular/core';
import { OverviewHelpComponent } from './overview.component';
import { AboutComponent } from '../../help/help.component';
import { HelpService } from '../../help/help.service';
import { HelpTopic } from '../../help/help.class';

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
