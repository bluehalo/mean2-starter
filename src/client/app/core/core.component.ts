import { ConfigService } from './config.service';
import { User } from '../admin/user.class';
import { AuthenticationService } from '../admin/authentication/authentication.service';

export class CoreComponent {
	config: any;

	banner: any;
	copyright: any;
	pki: boolean;
	collapsed: boolean = true;

	user: User;

	constructor(
		public auth: AuthenticationService,
		public configService: ConfigService
	) {}

	ngOnInit() {
		this.user = this.auth.getCurrentUser();

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
