import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { TooltipModule } from 'ng2-bootstrap';

import { UtilModule } from 'app/shared';

import { ListTagsComponent } from './list-tags.component';
import { ManageTagComponent } from './manage-tag.component';
import { TagsRoutingModule } from './tags-routing.module';
import { TagAudit } from './audit/tag-audit.component';

@NgModule({
	imports: [
		TagsRoutingModule,

		CommonModule,
		Ng2BootstrapModule,
		TooltipModule,
		UtilModule
	],
	entryComponents: [
		TagAudit
	],
	exports: [
		ListTagsComponent,
		TagAudit
	],
	declarations: [
		ListTagsComponent,
		ManageTagComponent,
		TagAudit
	],
	providers: [
	]
})
export class TagsModule { }
