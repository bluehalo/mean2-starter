import { Injectable } from '@angular/core';

@Injectable()
export class BaseService {
	constructor() {
		console.log('BaseService constructor');
	}

	public whoAmI(): string {
		return 'BaseService';
	}
}

@Injectable()
export class BaseService2 {
	constructor() {
		console.log('BaseService2 constructor');
	}

	public whoAmI(): string {
		return 'BaseService2';
	}
}
