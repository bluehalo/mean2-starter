import { Component } from '@angular/core';

import * as _ from 'lodash';
import { DialogRef, ModalComponent } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';

export class AuditViewDetailModalContext extends BSModalContext {
	auditEntry: any;

	constructor() {
		super();
		this.size = 'lg';
	}
}

@Component({
	templateUrl: './audit-view-details.component.html'
})
export class AuditViewDetailModal implements ModalComponent<AuditViewDetailModalContext> {
	context: AuditViewDetailModalContext;

	constructor(
		public dialog: DialogRef<AuditViewDetailModalContext>
	) {
		this.context = dialog.context;
	}

	/**
	 * Invoked before a modal is dismissed, return true to cancel dismissal.
	 */
	beforeDismiss(): boolean {
		return false;
	}
	/**
	 * Invoked before a modal is closed, return true to cancel closing.
	 */
	beforeClose(): boolean {
		return false;
	}

	done() {
		this.dialog.close();
	}
}

@Component({
	templateUrl: './audit-view-change.component.html'
})
export class AuditViewChangeModal extends AuditViewDetailModal {

	constructor(
		dialog: DialogRef<AuditViewDetailModalContext>
	) {
		super(dialog);
	}

	// Derived from http://stackoverflow.com/a/1359808 and http://stackoverflow.com/a/23124958
	sortObjectKeys(obj: any): any {
		if (null == obj || !_.isObject(obj)) {
			return obj;
		}

		// Maintain the order of arrays, but sort keys of the array elements
		if (_.isArray(obj)) {
			return obj.map( (o: any) => this.sortObjectKeys(o));
		}

		let sorted: any = {};
		let keys: string[] = _.keys(obj).sort();

		for (let key of keys) {
			sorted[key] = this.sortObjectKeys(obj[key]);
		}

		return sorted;
	}
}
