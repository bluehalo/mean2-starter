import { Component, Input, Output, EventEmitter } from '@angular/core';

import * as _ from 'lodash';

@Component({
	selector: 'asy-constrained-query',
	templateUrl: './constrained-query.component.html'
})

export class ConstrainedQuery {

	@Input() readOnly: boolean = false;

	@Input() placeholder: string = 'Start typing for selections...';

	@Input()
	get selectedQueries(): string[] {
		return this._selectedQueries;
	}
	set selectedQueries(queries: string[]) {
		this._selectedQueries = queries;
		if (queries.length === 0) {
			this._allowedQueries = this._originalAllowedQueries;
			this.availableQueries = this._originalAllowedQueries;
		}
	}

	@Input()
	get allowedQueries(): string[] {
		return this._allowedQueries;
	}
	set allowedQueries(queries: string[]) {
		this._allowedQueries = queries;
		this.availableQueries = queries;
		this._originalAllowedQueries = queries;
	}

	@Output() onChange: EventEmitter<any> = new EventEmitter();

	query: string = '';

	_originalAllowedQueries: string[] = [];

	_allowedQueries: string[] = [];

	_selectedQueries: string[] = [];

	availableQueries: string[] = [];

	constructor() {}

	isValid(selectedString: string) {
		return this.allowedQueries.indexOf(selectedString) !== -1;
	}

	formatQuery() {
		return (this._selectedQueries.length === 0) ? {} : { 'or': this._selectedQueries };
	}

	typeaheadOnSelect(e: any) {
		this.addToQuery(e.item);
	}

	addToQuery(selectedString: string) {
		if (this.isValid(selectedString)) {
			// Check if the string has already been added
			if (this._selectedQueries.indexOf(selectedString) === -1) {
				this._selectedQueries.push(selectedString);
				this.availableQueries = _.without(this.availableQueries, selectedString);
				this.onChange.emit({ queryObj: this.formatQuery(), queryArray: this._selectedQueries });
			}
		}
		this.query = '';
	}

	removeFromQuery(selectedString: string) {
		if (this.isValid(selectedString)) {
			let index = this._selectedQueries.indexOf(selectedString);
			if (index !== -1) {
				this._selectedQueries.splice(index, 1);
				this.availableQueries.push(selectedString);
				this.query = '';

				this.onChange.emit({ queryObj: this.formatQuery(), queryArray: this._selectedQueries });
			}
		}
	}
}
