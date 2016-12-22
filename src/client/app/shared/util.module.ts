import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { AddRemoveTypeaheadList } from './add-remove-typeahead-list.component';
import { AgoDatePipe } from './ago-date.pipe';
import { AlertService } from './alert.service';
import { AsyHttp } from './asy-http.service';
import { AddRemoveList } from './add-remove-list.component';
import { CamelToHumanPipe } from './camel-to-human.pipe';
import { SafeImageComponent } from './safe-image.component';
import { AsyLoading } from './loading-animation.component';
import { AsyUrlHandler } from './asy-url-handler.service';
import { BigNumberPipe } from './big-number.pipe';
import { CapitalizePipe } from './capitalize.pipe';
import { ConfirmModal } from './confirm.component';
import { ConstrainedQuery } from './constrained-query.component';
import { ExportConfigService } from './export-config.service';
import { InLineEdit } from './in-line-edit.component';
import { Pager } from './pager.component';
import { AreaPipe } from './area.pipe';
import { KeysPipe } from './keys.pipe';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		Ng2BootstrapModule
	],
	exports: [
		AddRemoveList,
		AddRemoveTypeaheadList,
		AgoDatePipe,
		AreaPipe,
		AsyLoading,
		BigNumberPipe,
		CamelToHumanPipe,
		CapitalizePipe,
		ConfirmModal,
		ConstrainedQuery,
		InLineEdit,
		SafeImageComponent,
		Pager,
		KeysPipe
	],

	declarations: [
		AddRemoveList,
		AddRemoveTypeaheadList,
		AgoDatePipe,
		AreaPipe,
		AsyLoading,
		BigNumberPipe,
		CamelToHumanPipe,
		CapitalizePipe,
		ConfirmModal,
		ConstrainedQuery,
		InLineEdit,
		SafeImageComponent,
		Pager,
		KeysPipe
	],
	providers: [
		AlertService,
		AsyHttp,
		AsyUrlHandler,
		ExportConfigService
	],
	entryComponents: [
	]
})
export class UtilModule { }
