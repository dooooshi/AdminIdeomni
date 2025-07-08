import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import authEn from '../configs/auth-i18n/en';
import authZhCn from '../configs/auth-i18n/zh-cn';
import mapEn from '../configs/map-i18n/en';
import mapZhCn from '../configs/map-i18n/zh-cn';

/**
 * resources is an object that contains all the translations for the different languages.
 */
const resources = {
	'en-US': {
		translation: {
			'Welcome to React': 'Welcome to React and react-i18next'
		},
		auth: authEn,
		map: mapEn
	},
	'zh-CN': {
		translation: {
			'Welcome to React': '欢迎使用 React 和 react-i18next'
		},
		auth: authZhCn,
		map: mapZhCn
	}
};

/**
 * i18n is initialized with the resources object and the language to use.
 * The keySeparator option is set to false because we do not use keys in form messages.welcome.
 * The interpolation option is set to false because we do not use interpolation in form messages.welcome.
 */
i18n.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources,
		lng: 'zh-CN',

		keySeparator: false, // we do not use keys in form messages.welcome

		interpolation: {
			escapeValue: false // react already safes from xss
		}
	});

export default i18n;
