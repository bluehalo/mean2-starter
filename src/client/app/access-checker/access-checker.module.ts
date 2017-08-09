import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AlertModule } from 'ngx-bootstrap';

import { ViewCacheEntryModal } from './view-cache-entry.component';
import { CacheEntriesService } from './cache-entries.service';
import { AdminCacheEntriesComponent } from './admin-cache-entries.component';
import { UtilModule } from '../shared/util.module';

@NgModule({
	imports: [
		AlertModule.forRoot(),

		CommonModule,
		FormsModule,
		UtilModule
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
