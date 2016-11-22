import {Component} from '@angular/core';

@Component({
	selector: 'invalid-resource',
	templateUrl: './invalid.resource.component.html'
})

export class InvalidResourceComponent {
	private type: string;

	constructor(
		// private routeParams: RouteParams,
	) {}

	ngOnInit() {
	}
}
