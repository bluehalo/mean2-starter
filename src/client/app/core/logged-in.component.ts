import { Component } from '@angular/core';
import { ExportConfigService } from '../shared/export-config.service';

@Component({
	template:
		`
		<div>This is a test page as part of the starter to prove login and routing works.</div>
		<br>
		<button class="btn btn-default" (click)="exportHW()">Export "hello world"</button>`
})

/**
 * This is just a test component to have something to login to as part of the mean starter
 */
export class LoggedInComponent {
	constructor(
		public exportConfigService: ExportConfigService
	) {
	}

	exportHW() {
		this.exportConfigService.postExportConfig('example', { value: 'hello world!!!' })
			.subscribe((response: any) => {
				window.open(`/export/${response._id}`);
			});
	}
}
