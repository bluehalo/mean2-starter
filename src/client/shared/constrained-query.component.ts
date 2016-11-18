import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'asy-constrained-query',
	templateUrl: './constrained-query.component.html'
})

export class ConstrainedQuery {

	@Input() readOnly: boolean = false;
	@Input() placeholder: string = 'Start typing for selections...';
	@Input() allowedQueries: string[] = [];

	@Output() onChange: EventEmitter<any> = new EventEmitter();

	private query: string = '';

	private selectedQueries: string[] = [];

	constructor() {}

	private isValid(selectedString: string) {
		return (this.allowedQueries.indexOf(selectedString) === -1) ? false : true;
	}

	private formatQuery() {
		return (this.selectedQueries.length === 0) ? {} : { 'or': this.selectedQueries };
	}

	private typeaheadOnSelect(e: any) {
		this.addToQuery(e.item);
	}

	private addToQuery(selectedString: string) {
		if (this.isValid(selectedString)) {
			// Check if the string has already been added
			if (this.selectedQueries.indexOf(selectedString) === -1) {
				this.selectedQueries.push(selectedString);
				this.onChange.emit({ queryObj: this.formatQuery(), queryArray: this.selectedQueries });
			}
		}
		this.query = '';
	}

	private removeFromQuery(selectedString: string) {
		if (this.isValid(selectedString)) {
			let index = this.selectedQueries.indexOf(selectedString);
			if (index !== -1) {
				this.selectedQueries.splice(index, 1);
				this.query = '';

				this.onChange.emit({ queryObj: this.formatQuery(), queryArray: this.selectedQueries });
			}
		}
	}
}
