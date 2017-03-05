import { Component } from '@angular/core';
import { Response } from '@angular/http';

import { BSModalContext } from 'angular2-modal/plugins/bootstrap/index';

import { AdminService } from '../admin.service';
import { ModalComponent, DialogRef } from 'angular2-modal';

export class ExportUsersModalContext extends BSModalContext {

	constructor() {
		super();
		this.size = 'lg';
	}
}

@Component({
	selector: 'export-users-modal',
	templateUrl: './export-users.component.html'
})
export class ExportUsersModal implements ModalComponent<ExportUsersModalContext> {

	selectedField = 'username';
	delimiter = '; ';
	value = '';
	query = '{}';
	queryValid = true;
	valuesArray: string[] = [];
	context: ExportUsersModalContext;

	constructor(
		public dialog: DialogRef<ExportUsersModalContext>,
		public adminService: AdminService,
	) {
		this.context = dialog.context;
	}

	static isJsonString(str: string): boolean {
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

	done() {
		this.dialog.close();
	}

	retrieveUsers() {
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

	updateQuery() {
		this.queryValid = ExportUsersModal.isJsonString(this.query);
		if (this.queryValid) {
			this.retrieveUsers();
		}
	}

	updateValue() {
		this.value = this.valuesArray.join(this.delimiter || ';');
	}

}
