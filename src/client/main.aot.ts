import './vendor';
import './configuration';

import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { AppModuleNgFactory } from './app/app.module.ngfactory';

declare var config: any;

if (null != config && config.clientEnableProdMode) {
	enableProdMode();
}

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);

