import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import * as _ from 'lodash';

@Component({
	selector: 'invalid-resource',
	templateUrl: './invalid.resource.component.html'
})

export class InvalidResourceComponent {

	private type: string = 'Resource';

	constructor(
		private route: ActivatedRoute
	) {}

	ngOnInit() {
		this.route.params.subscribe((params: Params) => {
			let type = params[`type`];

			if (!_.isEmpty(type)) {
				this.type = _.capitalize(params[`type`]);
			}
		});
	}
}
