import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { localeResources } from './locales';

/**
 * i18n is initialized with the consolidated locale resources.
 * The keySeparator option is set to false because we do not use keys in form messages.welcome.
 * The interpolation option is set to false because we do not use interpolation in form messages.welcome.
 */
i18n.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources: localeResources,
		lng: 'zh-CN',

		keySeparator: false, // we do not use keys in form messages.welcome

		interpolation: {
			escapeValue: false // react already safes from xss
		}
	});

export default i18n;
