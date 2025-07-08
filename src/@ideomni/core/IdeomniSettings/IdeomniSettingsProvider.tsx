import { useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import _ from 'lodash';
import { defaultSettings, getParsedQuerySettings } from '@ideomni/default-settings';
import settingsConfig from 'src/configs/settingsConfig';
import themeLayoutConfigs from 'src/components/theme-layouts/themeLayoutConfigs';
import { IdeomniSettingsConfigType, IdeomniThemesType } from '@ideomni/core/IdeomniSettings/IdeomniSettings';
import { useAuth } from 'src/lib/auth';
import { PartialDeep } from 'type-fest';
import IdeomniSettingsContext from './IdeomniSettingsContext';

// Get initial settings
const getInitialSettings = (): IdeomniSettingsConfigType => {
	const defaultLayoutStyle = settingsConfig.layout?.style || 'layout1';
	const layout = {
		style: defaultLayoutStyle,
		config: themeLayoutConfigs[defaultLayoutStyle]?.defaults
	};
	return _.merge({}, defaultSettings, { layout }, settingsConfig, getParsedQuerySettings());
};

const initialSettings = getInitialSettings();

const generateSettings = (
	_defaultSettings: IdeomniSettingsConfigType,
	_newSettings: PartialDeep<IdeomniSettingsConfigType>
) => {
	return _.merge(
		{},
		_defaultSettings,
		{ layout: { config: themeLayoutConfigs[_newSettings?.layout?.style]?.defaults } },
		_newSettings
	);
};

// IdeomniSettingsProvider component
export function IdeomniSettingsProvider({ children }: { children: ReactNode }) {
	const { user, isAuthenticated } = useAuth();

	const userSettings = useMemo(() => {
		// For now, return empty settings since we don't have user settings in the new auth system yet
		return {};
	}, [user]);

	const calculateSettings = useCallback(() => {
		const defaultSettings = _.merge({}, initialSettings);
		return !isAuthenticated ? defaultSettings : _.merge({}, defaultSettings, userSettings);
	}, [isAuthenticated, userSettings]);

	const [data, setData] = useState<IdeomniSettingsConfigType>(calculateSettings());

	// Sync data with userSettings when isGuest or userSettings change
	useEffect(() => {
		const newSettings = calculateSettings();

		// Only update if settings are different
		if (!_.isEqual(data, newSettings)) {
			setData(newSettings);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [calculateSettings]);

	const setSettings = useCallback(
		(newSettings: Partial<IdeomniSettingsConfigType>) => {
			const _settings = generateSettings(data, newSettings);

			if (!_.isEqual(_settings, data)) {
				setData(_.merge({}, _settings));
			}

			return _settings;
		},
		[data]
	);

	const changeTheme = useCallback(
		(newTheme: IdeomniThemesType) => {
			const { navbar, footer, toolbar, main } = newTheme;

			const newSettings: IdeomniSettingsConfigType = {
				...data,
				theme: {
					main,
					navbar,
					toolbar,
					footer
				}
			};

			setSettings(newSettings);
		},
		[data, setSettings]
	);

	return (
		<IdeomniSettingsContext
			value={useMemo(
				() => ({
					data,
					setSettings,
					changeTheme
				}),
				[data, setSettings, changeTheme]
			)}
		>
			{children}
		</IdeomniSettingsContext>
	);
}

export default IdeomniSettingsProvider;
