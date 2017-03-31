import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { ViewCacheEntryModal } from './view-cache-entry.component';
import { CacheEntriesService } from './cache-entries.service';
import { AdminCacheEntriesComponent } from './admin-cache-entries.component';
import { UtilModule } from 'app/shared/util.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		UtilModule,
		Ng2BootstrapModule
	],
	entryComponents: [
		ViewCacheEntryModal
	],
	declarations: [
		AdminCacheEntriesComponent,
		ViewCacheEntryModal
	],
	exports: [
		AdminCacheEntriesComponent
	],
	providers: [
		CacheEntriesService
	]
})
export class AccessCheckerModule { }
