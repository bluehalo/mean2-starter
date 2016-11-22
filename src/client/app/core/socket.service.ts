import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { AuthenticationService } from '../admin/authentication/authentication.service';
import { UserStateService } from '../admin/authentication/user-state.service';

/**
 * Handles sockets for the application
 */

@Injectable()
export class SocketService {

	protected socket: SocketIOClient.Socket;

	constructor(
		private auth: AuthenticationService,
		private userStateService: UserStateService) {
	}

	public initialize(): void {
		// Do not autoconnect when the socket is created.  We will wait to do that ourselves once the
		// user has logged in.
		this.socket = io.connect({
			autoConnect: false
		});

		// If the user is already active, connect to the socket right away.
		if (this.userStateService.user.isActive()) {
			this.socket.connect();
		}

		this.auth.initializing$.subscribe(() => {
			if (this.userStateService.user.isAuthenticated()) {
				// enable sockets/messaging
				this.socket.connect();
			}
			else {
				this.socket.disconnect();
			}
		});

	}

	public on(eventName: string, callback: Function) {
		this.socket.on(eventName, (event: any) => {
			callback.apply(this.socket, [event]);
		});
	}

	public emit(eventName: string) {
		console.log(eventName);
		this.socket.emit(eventName);
	}
}
