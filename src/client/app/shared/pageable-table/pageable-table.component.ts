import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, TemplateRef } from '@angular/core';
import * as _ from 'lodash';

import { AsyTemplate } from './../asy-template.directive';
import { SortDisplayOption } from './../result-utils.class';
import { PagingOptions, PageChange } from './../pager.component';

export type TableSortOptions = {
	[name: string]: SortDisplayOption
};

@Component({
	selector: 'pageable-table',
	templateUrl: 'pageable-table.component.html'
})

export class PageableTable {

	@Input() items: Array<any>;
	@Input() pagingOptions: PagingOptions = new PagingOptions();
	@Input() sortOptions: TableSortOptions;
	@Input() refreshable: boolean = false;

	@Output() onPageChange = new EventEmitter<PageChange>();
	@Output() onSortChange = new EventEmitter<SortDisplayOption>();
	@Output() onRefresh = new EventEmitter();

	@ContentChildren(AsyTemplate) templates: QueryList<AsyTemplate>;

	headerTemplate: TemplateRef<any>;
	rowTemplate: TemplateRef<any>;
	emptyTableTemplate: TemplateRef<any>;

	ngAfterContentInit() {
		const typeTemplatePairs = this.templates.map((template): [string, TemplateRef<any>] => [template.type, template.templateRef]);
		const userSuppliedTemplates = _.fromPairs(typeTemplatePairs);
		this.headerTemplate = userSuppliedTemplates['table-header'];
		this.rowTemplate = userSuppliedTemplates['table-row'];
		this.emptyTableTemplate = userSuppliedTemplates['empty-table'];
	}
}
