import { Injectable } from '@angular/core';

@Injectable()
export class BaseService {
	constructor() {

	}

	public whoAmI(): string {
		return 'BaseService';
	}
}

@Injectable()
export class BaseService2 {
	constructor() {

	}

	public whoAmI(): string {
		return 'BaseService2';
	}
}
