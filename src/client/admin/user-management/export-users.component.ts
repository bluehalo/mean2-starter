import { Component } from '@angular/core';
import { Response } from '@angular/http';

import { AdminService } from '../admin.service';

export class ExportUsersModalContext {
// extends BSModalContext {
// 	constructor(
// 	){
// 		super();
// 		this.size ='lg';
// 	}
}

@Component({
	selector: 'export-users-modal',
	templateUrl: './export-users.component.html'
})
export class ExportUsersModal /*implements ModalComponent<ExportUsersModalContext>*/ {

	private selectedField = 'username';
	private delimiter = '; ';
	private value = '';
	private query = '{}';
	private queryValid = true;
	private valuesArray: string[] = [];
	private context: ExportUsersModalContext;

	constructor(
		public adminService: AdminService,
	) {
	}

	private static isJsonString(str: string): boolean {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}

	ngOnInit() {
		this.retrieveUsers();
	}

	private done() {
		// this.dialog.close();
	}

	private retrieveUsers() {
		if (null != this.selectedField && this.queryValid) {
			this.adminService.getAll(JSON.parse(this.query), this.selectedField)
				.subscribe((users: string[]) => {
					this.valuesArray = users;
					this.updateValue();
				}, (response: Response) => {
					if (response.status >= 400 && response.status < 500) {
						this.value = 'Unable to retrieve field values: ' + response.json().message;
					}
				});
		}
	}

	private updateQuery() {
		this.queryValid = ExportUsersModal.isJsonString(this.query);
		if (this.queryValid) {
			this.retrieveUsers();
		}
	}

	private updateValue() {
		this.value = this.valuesArray.join(this.delimiter || ';');
	}

}
