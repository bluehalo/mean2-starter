'use strict';

import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { JustificationsService } from './justifications.service';
import { PagingOptions } from '../shared/pager.component';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { User } from '../admin/user.class';

@Component({
	selector: 'justificationsTypeahead',
	templateUrl: './justifications-typeahead.component.html'
})
export class JustificationsTypeaheadComponent implements OnInit {

	@Input() placeholder: string = 'Enter justification...';

	@Input() waitMs: number = 500;

	@Input() optionsLimit: number = 10;

	@Input() searchFn: (query: any, search: string, paging: PagingOptions) => Observable<any>;

	@Input() justificationValue: string;
	@Output() justificationChange = new EventEmitter<string>();
	get justification() {
		return this.justificationValue;
	}
	set justification(value: string) {
		this.justificationValue = value;
		this.justificationChange.emit(this.justificationValue);
	}

	private justificationOptions: Observable<any>;

	private typeaheadLoadingValue: boolean = false;
	@Output() private typeaheadLoadingChange = new EventEmitter<boolean>();
	get typeaheadLoading() {
		return this.typeaheadLoadingValue;
	}
	set typeaheadLoading(value: boolean) {
		this.typeaheadLoadingValue = value;
		this.typeaheadLoadingChange.emit(this.typeaheadLoadingValue);
	}

	private user: User;

	constructor(
		private justificationsService: JustificationsService,
		private authService: AuthenticationService
	) {
	}

	ngOnInit(): void {
		this.user = this.authService.getCurrentUser();
		this.initializeJustificationOptions();
	}

	changeTypeaheadLoading(e: boolean): void {
		this.typeaheadLoading = e;
	}

	/**
	 * Scour ten of currently logged in user's justification cache in order of most to least recently entered,
	 * filtering by current search term
	 */
	private initializeJustificationOptions(): void {

		if (null == this.searchFn) {
			this.searchFn = this.justificationsService.searchJustifications.bind(this.justificationsService);
		}

		this.justificationOptions = Observable.create((observable: any) => {
			observable.next(this.justification);
		}).mergeMap((search: string) => {
			let query = {'owner': this.user.userModel._id};

			if (null != search) {
				query['text'] = {$regex: search};
			}

			return this.searchFn(query, null, new PagingOptions(0, 10))
				.onErrorResumeNext()
				.map((result: any) => {
					return result.elements.map((element: any) => element.text);
				});
	});
}

}
