import i18n from '@i18n';
import { IdeomniNavItemType } from '@ideomni/core/IdeomniNavigation/types/IdeomniNavItemType';
import { enUS, zhCN } from '@i18n/locales';

// Add navigation translations to i18n
i18n.addResourceBundle('en-US', 'navigation', enUS.navigation);
i18n.addResourceBundle('zh-CN', 'navigation', zhCN.navigation);


/**
 * Super Admin Navigation Configuration (adminType: 1)
 * Full access navigation for super admin users
 */
const superAdminNavigationConfig: IdeomniNavItemType[] = [
	{
		id: 'admin-management',
		title: 'Admin Management',
		subtitle: 'Super admin exclusive features',
		type: 'group',
		icon: 'heroicons-outline:shield-check',
		translate: 'ADMIN_MANAGEMENT',
		auth: ['admin'],
		children: [
			{
				id: 'admin-management.admin-accounts',
				title: 'Admin Accounts',
				type: 'item',
				icon: 'heroicons-outline:user-plus',
				url: '/admin-management',
				translate: 'ADMIN_ACCOUNTS',
				auth: ['admin']
			},
			{
				id: 'admin-management.user-management',
				title: 'User Management',
				type: 'item',
				icon: 'heroicons-outline:users',
				url: '/user-management',
				translate: 'USER_MANAGEMENT',
				auth: ['admin']
			},
			{
				id: 'admin-management.activity-management',
				title: 'Activity Management',
				type: 'item',
				icon: 'heroicons-outline:calendar-days',
				url: '/activity-management',
				translate: 'ACTIVITY_MANAGEMENT',
				auth: ['admin']
			},
		]
	},
	{
		id: 'map',
		title: 'Map',
		subtitle: 'Map applications and tools',
		type: 'group',
		icon: 'heroicons-outline:map',
		translate: 'MAP',
		auth: ['admin'],
		children: [
			{
				id: 'map.template-management',
				title: 'Template Management',
				type: 'item',
				icon: 'heroicons-outline:cog-8-tooth',
				url: '/map-template-management',
				translate: 'MAP_TEMPLATE_MANAGEMENT',
				auth: ['admin']
			},
			{
				id: 'map.activity-tile-state-management',
				title: 'Activity Tile States',
				type: 'item',
				icon: 'heroicons-outline:chart-bar-square',
				url: '/activity-tile-state-management',
				translate: 'ACTIVITY_TILE_STATE_MANAGEMENT',
				auth: ['admin']
			},
			{
				id: 'map.test-map',
				title: 'Test Map',
				type: 'item',
				icon: 'heroicons-outline:beaker',
				url: '/map',
				translate: 'TEST_MAP',
				auth: ['admin']
			}
		]
	},
	
	{
		id: 'dashboards',
		title: 'Dashboards',
		subtitle: 'Unique dashboard designs',
		type: 'group',
		icon: 'heroicons-outline:home',
		translate: 'DASHBOARDS',
		auth: ['admin'],
		children: [
			{
				id: 'dashboards.project',
				title: 'Project',
				type: 'item',
				icon: 'heroicons-outline:clipboard-document-check',
				url: '/dashboards/project',
				translate: 'PROJECT',
				auth: ['admin']
			},
			{
				id: 'dashboards.analytics',
				title: 'Analytics',
				type: 'item',
				icon: 'heroicons-outline:chart-pie',
				url: '/dashboards/analytics',
				translate: 'ANALYTICS',
				auth: ['admin']
			},
			{
				id: 'dashboards.finance',
				title: 'Finance',
				type: 'item',
				icon: 'heroicons-outline:banknotes',
				url: '/dashboards/finance',
				translate: 'FINANCE',
				auth: ['admin']
			},
			{
				id: 'dashboards.crypto',
				title: 'Crypto',
				type: 'item',
				icon: 'heroicons-outline:currency-dollar',
				url: '/dashboards/crypto',
				translate: 'CRYPTO',
				auth: ['admin']
			},
			{
				id: 'apps.ecommerce',
				title: 'ECommerce',
				type: 'collapse',
				icon: 'heroicons-outline:shopping-cart',
				translate: 'ECOMMERCE',
				auth: ['admin'],
				children: [
					{
						id: 'e-commerce-products',
						title: 'Products',
						type: 'item',
						url: '/apps/e-commerce/products',
						end: true,
						translate: 'PRODUCTS',
						auth: ['admin']
					},
					{
						id: 'e-commerce-product-detail',
						title: 'Product Detail',
						type: 'item',
						url: '/apps/e-commerce/products/1/a-walk-amongst-friends-canvas-print',
						translate: 'PRODUCT_DETAIL',
						auth: ['admin']
					},
					{
						id: 'e-commerce-new-product',
						title: 'New Product',
						type: 'item',
						url: '/apps/e-commerce/products/new',
						translate: 'NEW_PRODUCT',
						auth: ['admin']
					},
					{
						id: 'e-commerce-orders',
						title: 'Orders',
						type: 'item',
						url: '/apps/e-commerce/orders',
						end: true,
						translate: 'ORDERS',
						auth: ['admin']
					},
					{
						id: 'e-commerce-order-detail',
						title: 'Order Detail',
						type: 'item',
						url: '/apps/e-commerce/orders/1',
						translate: 'ORDER_DETAIL',
						auth: ['admin']
					}
				]
			},
			{
				id: 'apps.help-center',
				title: 'Help Center',
				type: 'collapse',
				icon: 'heroicons-outline:information-circle',
				url: '/apps/help-center',
				translate: 'HELP_CENTER',
				auth: ['admin'],
				children: [
					{
						id: 'apps.help-center.home',
						title: 'Home',
						type: 'item',
						url: '/apps/help-center',
						end: true,
						translate: 'HOME',
						auth: ['admin']
					},
					{
						id: 'apps.help-center.faqs',
						title: 'FAQs',
						type: 'item',
						url: '/apps/help-center/faqs',
						translate: 'FAQS',
						auth: ['admin']
					},
					{
						id: 'apps.help-center.guides',
						title: 'Guides',
						type: 'item',
						url: '/apps/help-center/guides',
						translate: 'GUIDES',
						auth: ['admin']
					},
					{
						id: 'apps.help-center.support',
						title: 'Support',
						type: 'item',
						url: '/apps/help-center/support',
						translate: 'SUPPORT',
						auth: ['admin']
					}
				]
			},
			{
				id: 'apps.notifications',
				title: 'Notifications',
				type: 'item',
				icon: 'heroicons-outline:bell',
				url: '/apps/notifications',
				translate: 'NOTIFICATIONS',
				auth: ['admin']
			},
			{
				id: 'pages.activities',
				title: 'Activities',
				type: 'item',
				icon: 'heroicons-outline:bars-3-bottom-left',
				url: '/pages/activities',
				translate: 'ACTIVITIES',
				auth: ['admin']
			}
		]
	},
	

];

/**
 * Limited Admin Navigation Configuration (adminType: 2)
 * Restricted navigation for limited admin users
 */
const limitedAdminNavigationConfig: IdeomniNavItemType[] = [
	{
		id: 'map',
		title: 'Map',
		subtitle: 'Map applications and tools',
		type: 'group',
		icon: 'heroicons-outline:map',
		translate: 'MAP',
		auth: ['admin'],
		children: [
			{
				id: 'map.activity-tile-state-management',
				title: 'Activity Tile States',
				type: 'item',
				icon: 'heroicons-outline:chart-bar-square',
				url: '/activity-tile-state-management',
				translate: 'ACTIVITY_TILE_STATE_MANAGEMENT',
				auth: ['admin']
			},
			{
				id: 'map.test-map',
				title: 'Test Map',
				type: 'item',
				icon: 'heroicons-outline:beaker',
				url: '/map',
				translate: 'TEST_MAP',
				auth: ['admin']
			}
		]
	},
	
	{
		id: 'apps',
		title: 'Applications',
		subtitle: 'Limited application access',
		type: 'group',
		icon: 'heroicons-outline:squares-2x2',
		translate: 'APPLICATIONS',
		auth: ['admin'],
		children: [
			{
				id: 'apps.notifications',
				title: 'Notifications',
				type: 'item',
				icon: 'heroicons-outline:bell',
				url: '/apps/notifications',
				translate: 'NOTIFICATIONS',
				auth: ['admin']
			},
			{
				id: 'pages.activities',
				title: 'Activities',
				type: 'item',
				icon: 'heroicons-outline:bars-3-bottom-left',
				url: '/pages/activities',
				translate: 'ACTIVITIES',
				auth: ['admin']
			}
		]
	}
];

/**
 * Legacy Admin Navigation Configuration
 * For backward compatibility - defaults to super admin config
 */
const adminNavigationConfig: IdeomniNavItemType[] = superAdminNavigationConfig;

/**
 * User Navigation Configuration
 * Limited navigation for regular users - only Project dashboard
 */
const userNavigationConfig: IdeomniNavItemType[] = [
	{
		id: 'dashboards',
		title: 'Dashboards',
		subtitle: 'Project management',
		type: 'group',
		icon: 'heroicons-outline:home',
		translate: 'DASHBOARDS',
		auth: ['user'],
		children: [
			{
				id: 'dashboards.project',
				title: 'Project',
				type: 'item',
				icon: 'heroicons-outline:clipboard-document-check',
				url: '/dashboards/project',
				translate: 'PROJECT',
				auth: ['user']
			}
		]
	}
];

/**
 * Get navigation configuration based on user type and admin type
 */
export function getNavigationConfig(
	userType: 'admin' | 'user' | null, 
	adminType?: 1 | 2
): IdeomniNavItemType[] {
	if (userType === 'admin') {
		// For admin users, check adminType to return appropriate navigation
		if (adminType === 1) {
			return superAdminNavigationConfig; // Super Admin gets full access
		} else if (adminType === 2) {
			return limitedAdminNavigationConfig; // Limited Admin gets restricted access
		}
		// Fallback to super admin config for backward compatibility
		return superAdminNavigationConfig;
	}
	if (userType === 'user') {
		return userNavigationConfig;
	}
	// Return empty array for unauthenticated users
	return [];
}

/**
 * Get admin navigation configuration based on admin type
 */
export function getAdminNavigationConfig(adminType: 1 | 2): IdeomniNavItemType[] {
	if (adminType === 1) {
		return superAdminNavigationConfig;
	} else if (adminType === 2) {
		return limitedAdminNavigationConfig;
	}
	// Default fallback to super admin
	return superAdminNavigationConfig;
}

/**
 * Default navigation configuration (for backward compatibility)
 * This will be replaced by role-based configs
 */
const navigationConfig: IdeomniNavItemType[] = adminNavigationConfig;

export default navigationConfig;
export { 
	adminNavigationConfig, 
	superAdminNavigationConfig, 
	limitedAdminNavigationConfig, 
	userNavigationConfig 
};
