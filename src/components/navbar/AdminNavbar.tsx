'use client';

import { useMemo } from 'react';
import { useAppDispatch } from 'src/store/hooks';
import IdeomniNavigation from '@ideomni/core/IdeomniNavigation';
import { IdeomniNavigationProps } from '@ideomni/core/IdeomniNavigation/IdeomniNavigation';
import useThemeMediaQuery from '@ideomni/hooks/useThemeMediaQuery';
import clsx from 'clsx';
import i18n from '@i18n';
import useI18n from '@i18n/useI18n';
import { useAuth } from 'src/lib/auth';
import IdeomniUtils from '@ideomni/utils';
import IdeomniNavigationHelper from '@ideomni/utils/IdeomniNavigationHelper';
import { IdeomniNavItemType } from '@ideomni/core/IdeomniNavigation/types/IdeomniNavItemType';
import { adminNavigationConfig } from 'src/configs/navigationConfig';
import { navbarCloseMobile } from '../theme-layouts/components/navbar/navbarSlice';

/**
 * AdminNavbar
 * Navigation component specifically for admin users
 */

type AdminNavbarProps = Partial<IdeomniNavigationProps>;

function AdminNavbar(props: AdminNavbarProps) {
	const { className = '', layout = 'vertical', dense, active } = props;
	const { user, userType } = useAuth();
	const { languageId } = useI18n();
	const dispatch = useAppDispatch();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	// For admin users, we'll use a simple role mapping
	const userRole = userType === 'admin' ? ['admin'] : null;

	const navigation = useMemo(() => {
		function setAdditionalData(data: IdeomniNavItemType[]): IdeomniNavItemType[] {
			return data?.map((item) => ({
				hasPermission: Boolean(IdeomniUtils.hasPermission(item?.auth, userRole)),
				...item,
				...(item?.translate && item?.title ? { title: i18n.t(`navigation:${item?.translate}`) } : {}),
				...(item?.children ? { children: setAdditionalData(item?.children) } : {})
			}));
		}

		const translatedValues = setAdditionalData(adminNavigationConfig);
		return translatedValues;
	}, [userRole, languageId]);

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

export default AdminNavbar; 