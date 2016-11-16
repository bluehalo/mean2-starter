import {Component} from '@angular/core';

@Component({
	selector: 'invalid-resource',
	templateUrl: '../views/invalid.resource.client.view.html'
})

export class InvalidResourceComponent {
	private type: string;

	constructor(
		// private routeParams: RouteParams,
	) {}

	ngOnInit() {
	}
}
