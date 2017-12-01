import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import * as _ from 'lodash';
import { Subscription } from 'rxjs/Subscription';

@Component({
	selector: 'invalid-resource',
	templateUrl: 'invalid.resource.component.html'
})
export class InvalidResourceComponent {

	type: string = 'Resource';

	private routeParamSubscription: Subscription;

	constructor(private route: ActivatedRoute) {}

	ngOnInit() {
		this.routeParamSubscription = this.route.params.subscribe((params: Params) => {
			let type = params['type'];

			if (!_.isEmpty(type)) {
				this.type = _.capitalize(params['type']);
			}
		});
	}

	ngOnDestroy() {
		this.routeParamSubscription.unsubscribe();
	}
}
