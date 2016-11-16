import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { ConfirmModal } from './components/confirm.client.component';
import { ConstrainedQuery } from './components/constrained-query.client.component';
import { InLineEdit } from './components/in-line-edit.client.component';
import { AsyLoading } from './components/loading-animation.client.component';
import { Pager } from './components/pager.client.component';
import { AgoDatePipe } from './pipes/ago-date.client.pipe';
import { AsyUrlHandler } from './services/url-handlers/asy-url-handler.client.service';
import { AlertService } from './services/alert.client.service';
import { AsyHttp } from './services/asy-http.client.service';
import { ExportConfigService } from './services/export-config.client.service';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		Ng2BootstrapModule
	],
	exports: 		[
		AsyLoading,
		ConfirmModal,
		ConstrainedQuery,
		InLineEdit,
		Pager,
		AgoDatePipe
	],

	declarations: 	[
		AgoDatePipe,
		AsyLoading,
		ConfirmModal,
		ConstrainedQuery,
		InLineEdit,
		Pager
	],
	providers: [
		AlertService,
		AsyHttp,
		AsyUrlHandler,
		ExportConfigService
	],
})
export class UtilModule { }
