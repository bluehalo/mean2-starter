import { Component, Input } from '@angular/core';

@Component({
	selector: 'asy-loading-animation',
	template: `
		<div class='loading-animation text-center'>
			<span>{{ text }}</span>
			<i class='fa fa-spinner fa-spin'></i>
		</div>
	`
})

export class AsyLoading {

	@Input() text = 'Loading...';

	constructor(
	) {}
}
