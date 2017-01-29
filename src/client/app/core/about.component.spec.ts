import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { ConfigService } from './config.service';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
	let aboutComponent: AboutComponent;
	let fixture: ComponentFixture<AboutComponent>;
	let rootDebugElement: DebugElement;
	let rootNativeElement: HTMLElement;

	const testConfig = {
		version: 'TEST_VERSION_0.1.0',
		contactEmail: 'admin@example.com',
		app: {
			instanceName: 'TEST_INSTANCE'
		}
	};

	const configServiceStub = {
		getConfig() {
			return new BehaviorSubject(testConfig);
		}
	};

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AboutComponent],
			providers: [{provide: ConfigService, useValue: configServiceStub}]
		}).compileComponents();  // compile template and css
	}));

	beforeEach(() => {

		fixture = TestBed.createComponent(AboutComponent);

		aboutComponent = fixture.componentInstance;

		rootDebugElement = fixture.debugElement;
		rootNativeElement = rootDebugElement.nativeElement;

	});

	it('should display the current version', () => {
		fixture.detectChanges();
		expect(rootNativeElement.textContent).toContain(testConfig.version);
	});

	it('should display the admin email address', () => {
		fixture.detectChanges();
		expect(rootNativeElement.textContent).toContain(testConfig.contactEmail);
	});

});
