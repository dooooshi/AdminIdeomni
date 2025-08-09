'use client';

import { useMemo } from 'react';
import { useAppDispatch } from 'src/store/hooks';
import IdeomniNavigation from '@ideomni/core/IdeomniNavigation';
import { IdeomniNavigationProps } from '@ideomni/core/IdeomniNavigation/IdeomniNavigation';
import useThemeMediaQuery from '@ideomni/hooks/useThemeMediaQuery';
import clsx from 'clsx';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { useAuth } from 'src/lib/auth';
import IdeomniUtils from '@ideomni/utils';
import IdeomniNavigationHelper from '@ideomni/utils/IdeomniNavigationHelper';
import { IdeomniNavItemType } from '@ideomni/core/IdeomniNavigation/types/IdeomniNavItemType';
import { userNavigationConfig } from 'src/configs/navigationConfig';
import { navbarCloseMobile } from '../theme-layouts/components/navbar/navbarSlice';

/**
 * UserNavbar
 * Navigation component specifically for regular users
 * Only shows Project dashboard access
 */

type UserNavbarProps = Partial<IdeomniNavigationProps>;

function UserNavbar(props: UserNavbarProps) {
	const { className = '', layout = 'vertical', dense, active } = props;
	const { user, userType } = useAuth();
	const { i18n } = useTranslation();
	const dispatch = useAppDispatch();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	// For regular users, we'll use a simple role mapping
	const userRole = userType === 'user' ? ['user'] : null;

	const navigation = useMemo(() => {
		function setAdditionalData(data: IdeomniNavItemType[]): IdeomniNavItemType[] {
			return data?.map((item) => ({
				hasPermission: Boolean(IdeomniUtils.hasPermission(item?.auth, userRole)),
				...item,
				...(item?.translate && item?.title ? { title: i18n.t(`navigation:${item?.translate}`) } : {}),
				...(item?.children ? { children: setAdditionalData(item?.children) } : {})
			}));
		}

		const translatedValues = setAdditionalData(userNavigationConfig);
		return translatedValues;
	}, [userRole, i18n.language]);

	return useMemo(() => {
		function handleItemClick() {
			if (isMobile) {
				dispatch(navbarCloseMobile());
			}
		}

		return (
			<IdeomniNavigation
				className={clsx('navigation flex-1', className)}
				navigation={navigation}
				layout={layout}
				dense={dense}
				active={active}
				onItemClick={handleItemClick}
				checkPermission
			/>
		);
	}, [dispatch, isMobile, navigation, active, className, dense, layout]);
}

export default UserNavbar; 