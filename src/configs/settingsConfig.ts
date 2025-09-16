import themesConfig from 'src/configs/themesConfig';
import { IdeomniSettingsConfigType } from '@ideomni/core/IdeomniSettings/IdeomniSettings';

/**
 * The settingsConfig object is a configuration object for the Ideomni application's settings.
 */
const settingsConfig: IdeomniSettingsConfigType = {
	/**
	 * The layout object defines the layout style and configuration for the application.
	 */
	layout: {
		/**
		 * The style property defines the layout style for the application.
		 */
		style: 'layout1', // layout1
		/**
		 * The config property defines the layout configuration for the application.
		 * Check out default layout configs at src/components/theme-layouts for example src/components/theme-layouts/layout1/Layout1Config.js
		 */
		config: {
			mode: 'fullwidth',
			navbar: {
				style: 'style-2'
			}
		} // checkout default layout configs at src/components/theme-layouts for example  src/components/theme-layouts/layout1/Layout1Config.js
	},

	/**
	 * The customScrollbars property defines whether or not to use custom scrollbars in the application.
	 */
	customScrollbars: true,

	/**
	 * The direction property defines the text direction for the application.
	 */
	direction: 'ltr', // rtl, ltr
	/**
	 * The theme object defines the color theme for the application.
	 */
	theme: {
		main: themesConfig.default,
		navbar: themesConfig.default,
		toolbar: themesConfig.default,
		footer: themesConfig.default
	},

	/**
	 * The defaultAuth property defines the default authorization roles for the application.
	 * To make the whole app auth protected by default set defaultAuth:['admin','staff','user']
	 * To make the whole app accessible without authorization by default set defaultAuth: null
	 * The individual route configs which have auth option won't be overridden.
	 */
	defaultAuth: ['admin'],

	/**
	 * The loginRedirectUrl property defines the default redirect URL for the logged-in user.
	 */
	loginRedirectUrl: '/'
};

export default settingsConfig;
