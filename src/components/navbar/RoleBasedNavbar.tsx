'use client';

import { useMemo } from 'react';
import { useAuth } from 'src/lib/auth';
import { AdminUser } from 'src/lib/auth/types';
import { IdeomniNavigationProps } from '@ideomni/core/IdeomniNavigation/IdeomniNavigation';
import AdminNavbar from './AdminNavbar';
import UserNavbar from './UserNavbar';

/**
 * RoleBasedNavbar
 * Smart navigation component that renders the appropriate navbar based on user role
 * - AdminNavbar for admin users (full access)
 * - UserNavbar for regular users (limited to Project dashboard)
 */

type RoleBasedNavbarProps = Partial<IdeomniNavigationProps>;

function RoleBasedNavbar(props: RoleBasedNavbarProps) {
	const { userType, isAuthenticated, user } = useAuth();

	const NavbarComponent = useMemo(() => {
		if (!isAuthenticated || !userType) {
			return null;
		}

		switch (userType) {
			case 'admin':
				return AdminNavbar;
			case 'user':
				return UserNavbar;
			default:
				return null;
		}
	}, [userType, isAuthenticated, user]);

	if (!NavbarComponent) {
		return null;
	}

	return <NavbarComponent {...props} />;
}

export default RoleBasedNavbar; 