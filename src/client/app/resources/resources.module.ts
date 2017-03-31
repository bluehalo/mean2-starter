import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { ManageResourceMetadataComponent } from './manage-resource-metadata.component';
import { UtilModule } from 'app/shared/util.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		Ng2BootstrapModule,
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
