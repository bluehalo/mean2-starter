import {
	Component, Input, ViewChild, ViewContainerRef, ComponentRef, ComponentFactoryResolver,
	ComponentFactory
} from '@angular/core';
import { AuditObjectTypes } from './audit.classes';

export let auditObjects: any[] = [];

@Component({
	selector: 'default',
	templateUrl: './templates/default.audit.view.html'
})
export class DefaultAudit {
	@Input() auditObject: any = {};
}
auditObjects.push(DefaultAudit);
AuditObjectTypes.registerType('default', DefaultAudit);

@Component({
	selector: 'url',
	templateUrl: './templates/url.audit.view.html'
})
export class UrlAudit extends DefaultAudit {}
auditObjects.push(UrlAudit);
AuditObjectTypes.registerType('url', UrlAudit);

@Component({
	selector: 'user-authentication',
	templateUrl: './templates/user-authentication.audit.view.html'
})
export class UserAuthenticationAudit extends DefaultAudit {}
auditObjects.push(UserAuthenticationAudit);
AuditObjectTypes.registerType('user-authentication', UserAuthenticationAudit);

@Component({
	selector: 'user',
	templateUrl: './templates/user.audit.view.html'
})
export class UserAudit extends DefaultAudit {}
auditObjects.push(UserAudit);
AuditObjectTypes.registerType('user', UserAudit);

@Component({
	selector: 'eua-audit',
	template: `
			<span *ngIf='auditObject'>
				<i class='fa fa-search'></i> {{auditObject?.title}}
			</span>
			`
})
export class EuaAudit extends DefaultAudit {}
auditObjects.push(EuaAudit);
AuditObjectTypes.registerType('eua', EuaAudit);

@Component({
	selector: 'message-audit',
	template: `
			<span *ngIf='auditObject'>
				<i class='fa fa-envelope-o'></i> {{auditObject?.title}} ({{auditObject?.type}})
			</span>
			`
})
export class MessageAudit extends DefaultAudit {}
auditObjects.push(MessageAudit);
AuditObjectTypes.registerType('message', MessageAudit);

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
		private componentFactoryResolver: ComponentFactoryResolver
	) {}

	ngOnInit() {
		let factory: ComponentFactory<Component> =
			this.componentFactoryResolver.resolveComponentFactory(AuditObjectTypes.objects[this.auditType]);

		this.componentRef = this.content.createComponent(factory);
		this.componentRef.instance.auditObject = this.auditObject;
	}
}
