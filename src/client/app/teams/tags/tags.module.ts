import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { TooltipModule } from 'ng2-bootstrap/ng2-bootstrap';

import { ListTagsComponent } from './list-tags.component';
import { ManageTagComponent } from './manage-tag.component';
import { UtilModule } from '../../shared/util.module';

@NgModule({
	imports: [
		CommonModule,
		Ng2BootstrapModule,
		RouterModule,
		TooltipModule,
		UtilModule
	],
	entryComponents: [],
	exports: [
		ListTagsComponent
	],
	declarations: 	[
		ListTagsComponent,
		ManageTagComponent
	],
	providers: [
	]
})
export class TagsModule { }
