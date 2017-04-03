import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { AccessCheckerRoutingModule } from './access-checker-routing.module';
import { ViewCacheEntryModal } from './entries/view-cache-entry.component';
import { CacheEntriesService } from './cache-entries.service';
import { ListCacheEntriesComponent } from './entries/list-cache-entries.component';
import { UtilModule } from '../shared/util.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		UtilModule,
		Ng2BootstrapModule,
		AccessCheckerRoutingModule
	],
	entryComponents: [
		ViewCacheEntryModal
	],
	declarations: [
		ListCacheEntriesComponent,
		ViewCacheEntryModal
	],
	exports: [
		ListCacheEntriesComponent
	],
	providers: [
		CacheEntriesService
	]
})
export class AccessCheckerModule { }
