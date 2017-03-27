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
import { BigNumberPipe } from './big-number.pipe';
import { CapitalizePipe } from './capitalize.pipe';
import { ConfirmModal } from './confirm.component';
import { ConstrainedQuery } from './constrained-query.component';
import { ExportConfigService } from './export-config.service';
import { InLineEdit } from './in-line-edit.component';
import { Pager } from './pager.component';
import { AsyTemplate } from './asy-template.directive';
import { AsyTransclude } from './asy-transclude.directive';
import { PageableTable } from './pageable-table/pageable-table.component';
import { AreaPipe } from './area.pipe';
import { KeysPipe } from './keys.pipe';
import { AsyDropdownComponent } from './dropdown/asy-dropdown.component';
import { AsyDropdownItemComponent } from './dropdown/asy-dropdown-item.component';
import { AsyDropdownService } from './dropdown/asy-dropdown.service';
import { AsyDropdownItemWrapperComponent } from './dropdown/asy-dropdown-item-wrapper.component';

import { UrlClickHandler } from './urlHandler/url-click-handler.component';
import { ListManager } from './list-manager.component';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		Ng2BootstrapModule
	],
	entryComponents: [
		UrlClickHandler
	],
	exports: [
		AsyDropdownComponent,
		AsyDropdownItemComponent,

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
		PageableTable,
		AsyTemplate,
		AsyTransclude,
		KeysPipe
	],

	declarations: [
		AddRemoveList,
		AddRemoveTypeaheadList,
		AgoDatePipe,
		AreaPipe,
		AsyDropdownComponent,
		AsyDropdownItemComponent,
		AsyDropdownItemWrapperComponent,
		AsyLoading,
		BigNumberPipe,
		CamelToHumanPipe,
		CapitalizePipe,
		ConfirmModal,
		ConstrainedQuery,
		InLineEdit,
		ListManager,
		SafeImageComponent,
		Pager,
		PageableTable,
		AsyTemplate,
		AsyTransclude,
		KeysPipe,
		UrlClickHandler
	],
	providers: [
		AlertService,
		AsyDropdownService,
		AsyHttp,
		ExportConfigService
	]
})
export class UtilModule { }
