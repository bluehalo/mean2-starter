import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { ViewCacheEntryModal } from './components/view-cache-entry.client.component';
import { CacheEntriesService } from './services/cache-entries.client.service';
import { AdminCacheEntriesComponent } from './components/admin-cache-entries.client.component';
import { UtilModule } from '../shared/util.module';

@NgModule({
	imports:         [ CommonModule, FormsModule, UtilModule, Ng2BootstrapModule ],
	entryComponents: [ ViewCacheEntryModal ],
	declarations:    [ AdminCacheEntriesComponent, ViewCacheEntryModal ],
	exports:         [ AdminCacheEntriesComponent ],
	providers:       [ CacheEntriesService ]
})
export class AccessCheckerModule { }
