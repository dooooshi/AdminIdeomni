import { DeepPartial } from 'react-hook-form';
import { IdeomniSettingsConfigType } from '@ideomni/core/IdeomniSettings/IdeomniSettings';

export const layoutConfigOnlyMain: DeepPartial<IdeomniSettingsConfigType>['layout'] = {
	config: {
		navbar: {
			display: false
		},
		toolbar: {
			display: false
		},
		footer: {
			display: false
		},
		leftSidePanel: {
			display: false
		},
		rightSidePanel: {
			display: false
		}
	}
};

export const layoutConfigOnlyMainFullWidth: DeepPartial<IdeomniSettingsConfigType>['layout'] = {
	config: {
		...layoutConfigOnlyMain.config,
		mode: 'fullwidth'
	}
};

export const layoutNoContainer: DeepPartial<IdeomniSettingsConfigType>['layout'] = {
	config: {
		mode: 'fullwidth'
	}
};
