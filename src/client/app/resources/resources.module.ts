import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { ManageResourceMetadataComponent } from './manage-resource-metadata.component';
import { UtilModule } from '../shared/util.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		UtilModule
	],
	entryComponents: [],
	exports: [
		ManageResourceMetadataComponent
	],
	declarations: [
		ManageResourceMetadataComponent
	],
	providers: [
	]
})
export class ResourcesModule { }
