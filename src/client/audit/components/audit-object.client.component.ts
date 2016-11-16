import { Component, Input, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { AuditObjectTypes } from '../model/audit.classes';

@Component({
	selector: 'default',
	templateUrl: '../views/templates/default.audit.client.view.html'
})
export class DefaultAudit {
	@Input() auditObject: any = {};
}

@Component({
	selector: 'url',
	templateUrl: '../views/templates/url.audit.client.view.html'
})
export class UrlAudit extends DefaultAudit {}

@Component({
	selector: 'user-authentication',
	templateUrl: '../views/templates/user-authentication.audit.client.view.html'
})
export class UserAuthenticationAudit extends DefaultAudit {}

@Component({
	selector: 'user',
	templateUrl: '../views/templates/user.audit.client.view.html'
})
export class UserAudit extends DefaultAudit {}

@Component({
	selector: 'eua-audit',
	template: `
			<span *ngIf='auditObject'>
				<i class='fa fa-search'></i> {{auditObject?.title}}
			</span>
			`
})
export class EuaAudit extends DefaultAudit {}

@Component({
	selector: 'message-audit',
	template: `
			<span *ngIf='auditObject'>
				<i class='fa fa-envelope-o'></i> {{auditObject?.title}} ({{auditObject?.type}})
			</span>
			`
})
export class MessageAudit extends DefaultAudit {}

@Component({
	selector: 'asy-audit-component',
	template: '<div #content></div>'
})
export class AuditObjectComponent {
	@ViewChild('content', {read: ViewContainerRef}) content: any;

	@Input() auditObject: any = {};
	@Input() auditType: string = '';

	private componentRef: ComponentRef<any>;

	constructor(
		// private componentResolver: ComponentResolver
	) {}

	ngOnInit() {
		let componentType: any = AuditObjectTypes.objects[this.auditType];
		// this.componentResolver.resolveComponent((_.isUndefined(componentType) ? DefaultAudit : componentType))
		// 	.then((factory:ComponentFactory<any>) => {
		// 		this.componentRef = this.content.createComponent(factory);
		// 		this.componentRef.instance.auditObject = this.auditObject;
		// 	});
	}
}
