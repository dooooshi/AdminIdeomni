'use client';

import { useAppSelector } from 'src/store/hooks';
import { useMemo } from 'react';
import i18n from '@i18n';
import { useAuth } from 'src/lib/auth';
import { AdminUser } from 'src/lib/auth/types';
import useI18n from '@i18n/useI18n';
import IdeomniUtils from '@ideomni/utils';
import IdeomniNavigationHelper from '@ideomni/utils/IdeomniNavigationHelper';
import { IdeomniNavItemType } from '@ideomni/core/IdeomniNavigation/types/IdeomniNavItemType';
import { selectNavigationAll } from '../store/navigationSlice';
import { getNavigationConfig } from 'src/configs/navigationConfig';

function useNavigation() {
	const { user, userType } = useAuth();
	// For now, we'll use a simple role mapping
	const userRole = userType ? [userType] : null;
	const { languageId } = useI18n();

	const navigationData = useAppSelector(selectNavigationAll);

	const navigation = useMemo(() => {
		// Get admin type for admin users
		const adminType = userType === 'admin' ? (user as AdminUser)?.adminType : undefined;
		// Get regular user type for regular users
		const regularUserType = userType === 'user' ? (user as any)?.userType : undefined;
		
		// Use role-based navigation config if available, otherwise fall back to store data
		const roleBasedConfig = getNavigationConfig(userType, adminType, regularUserType);
		const _navigation = roleBasedConfig.length > 0 
			? roleBasedConfig 
			: IdeomniNavigationHelper.unflattenNavigation(navigationData);

		function setAdditionalData(data: IdeomniNavItemType[]): IdeomniNavItemType[] {
			return data?.map((item) => ({
				hasPermission: Boolean(IdeomniUtils.hasPermission(item?.auth, userRole)),
				...item,
				...(item?.translate && item?.title ? { title: i18n.t(`navigation:${item?.translate}`) } : {}),
				...(item?.children ? { children: setAdditionalData(item?.children) } : {})
			}));
		}

		const translatedValues = setAdditionalData(_navigation);

		return translatedValues;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [navigationData, userRole, languageId, userType, user]);

	const flattenNavigation = useMemo(() => {
		return IdeomniNavigationHelper.flattenNavigation(navigation);
	}, [navigation]);

	return { navigation, flattenNavigation };
}

export default useNavigation;
