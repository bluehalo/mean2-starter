import './vendor.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';

declare var config: any;

if (null != config && config.clientEnableProdMode) {
	enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
