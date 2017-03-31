import { ConfigService } from './config.service';
import { User } from 'app/admin/user.class';
import { AuthenticationService } from 'app/admin/authentication/authentication.service';

export class CoreComponent {

	user: User;
	banner: any;
	copyright: any;
	pki: boolean;
	collapsed: boolean = true;

	protected config: any;

	constructor(
		protected authService: AuthenticationService,
		protected configService: ConfigService
	) {}

	ngOnInit() {
		this.user = this.authService.getCurrentUser();

		this.configService.getConfig()
			.subscribe( (config: any) =>  {
				this.config = config;
				this.banner = config.banner;
				this.banner.css = `banner-${config.banner.code}`;
				this.banner.css = this.banner.css.toLowerCase();
				this.copyright = config.copyright;
				this.pki = config.auth === 'proxy-pki';
			} );
	}
}
