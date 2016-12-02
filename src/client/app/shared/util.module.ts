import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { ConfirmModal } from './confirm.component';
import { ConstrainedQuery } from './constrained-query.component';
import { InLineEdit } from './in-line-edit.component';
import { AsyLoading } from './loading-animation.component';
import { Pager } from './pager.component';
import { AgoDatePipe } from './ago-date.pipe';
import { AsyUrlHandler } from './asy-url-handler.service';
import { AlertService } from './alert.service';
import { AsyHttp } from './asy-http.service';
import { ExportConfigService } from './export-config.service';
import { AddRemoveList } from './add-remove-list.component';
import {CamelToHumanPipe} from './camel-to-human.pipe';
import {BigNumberPipe} from './big-number.pipe';
import { SafeImageComponent } from './safe-image.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		Ng2BootstrapModule
	],
	exports: [
		AddRemoveList,
		AgoDatePipe,
		AsyLoading,
		ConfirmModal,
		ConstrainedQuery,
		InLineEdit,
		Pager,
		SafeImageComponent,
		CamelToHumanPipe,
		BigNumberPipe
	],

	declarations: [
		AddRemoveList,
		AgoDatePipe,
		AsyLoading,
		ConfirmModal,
		ConstrainedQuery,
		InLineEdit,
		Pager,
		SafeImageComponent,
		CamelToHumanPipe,
		BigNumberPipe
	],
	providers: [
		AlertService,
		AsyHttp,
		AsyUrlHandler,
		ExportConfigService
	],
})
export class UtilModule { }
