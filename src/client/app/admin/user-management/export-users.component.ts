import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { BsModalRef } from 'ngx-bootstrap';

import { AdminService } from '../admin.service';

@Component({
	templateUrl: 'export-users.component.html'
})
export class ExportUsersModal {

	selectedField = 'username';

	delimiter = '; ';

	value = '';

	query = '{}';

	queryValid = true;

	private valuesArray: string[] = [];

	constructor(
		private adminService: AdminService,
		public modalRef: BsModalRef
	) {}

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

	retrieveUsers() {
		if (null != this.selectedField && this.queryValid) {
			this.adminService.getAll(JSON.parse(this.query), this.selectedField).subscribe((users: string[]) => {
				this.valuesArray = users;
				this.updateValue();
			}, (error: HttpErrorResponse) => {
				if (error.status >= 400 && error.status < 500) {
					this.value = 'Unable to retrieve field values: ' + error.error.message;
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
