import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TooltipModule } from 'ngx-bootstrap';

import { ListTagsComponent } from './list-tags.component';
import { ManageTagComponent } from './manage-tag.component';
import { TagsRoutingModule } from './tags-routing.module';
import { UtilModule } from '../../shared/util.module';
import { TagAudit } from './audit/tag-audit.component';

@NgModule({
	imports: [
		TooltipModule.forRoot(),

		TagsRoutingModule,

		CommonModule,
		FormsModule,
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
