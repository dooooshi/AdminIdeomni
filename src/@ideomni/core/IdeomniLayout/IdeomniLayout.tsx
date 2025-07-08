'use client';

import _ from 'lodash';
import React, { useEffect, useMemo } from 'react';
import { IdeomniSettingsConfigType } from '@ideomni/core/IdeomniSettings/IdeomniSettings';
import { themeLayoutsType } from 'src/components/theme-layouts/themeLayouts';
import usePathname from '@ideomni/hooks/usePathname';
import useIdeomniSettings from '@ideomni/core/IdeomniSettings/hooks/useIdeomniSettings';
import IdeomniLayoutSettingsContext from './IdeomniLayoutSettingsContext';

export type IdeomniRouteObjectType = {
	settings?: IdeomniSettingsConfigType;
	auth?: string[] | [] | null | undefined;
};

export type IdeomniLayoutProps = {
	layouts: themeLayoutsType;
	children?: React.ReactNode;
	settings?: IdeomniSettingsConfigType['layout'];
};

/**
 * IdeomniLayout
 * React frontend component in a React project that is used for layouting the user interface. The component
 * handles generating user interface settings related to current routes, merged with default settings, and uses
 * the new settings to generate layouts.
 */
function IdeomniLayout(props: IdeomniLayoutProps) {
	const { layouts, children, settings: forcedSettings } = props;

	const { data: current } = useIdeomniSettings();
	const currentLayoutSetting = useMemo(() => current.layout, [current]);
	const pathname = usePathname();

	const layoutSetting = useMemo(
		() => _.merge({}, currentLayoutSetting, forcedSettings),
		[currentLayoutSetting, forcedSettings]
	);

	const layoutStyle = useMemo(() => layoutSetting.style, [layoutSetting]);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return (
		<IdeomniLayoutSettingsContext value={layoutSetting}>
			{useMemo(() => {
				return Object.entries(layouts).map(([key, Layout]) => {
					if (key === layoutStyle) {
						return (
							<React.Fragment key={key}>
								<Layout>{children}</Layout>
							</React.Fragment>
						);
					}

					return null;
				});
			}, [layoutStyle, layouts, children])}
		</IdeomniLayoutSettingsContext>
	);
}

export default IdeomniLayout;
