import i18n from '@i18n';
import { IdeomniNavItemType } from '@ideomni/core/IdeomniNavigation/types/IdeomniNavItemType';
import { enUS, zhCN } from '@i18n/locales';

// Add navigation translations to i18n
i18n.addResourceBundle('en-US', 'navigation', enUS.navigation);
i18n.addResourceBundle('zh-CN', 'navigation', zhCN.navigation);


/**
 * Admin Navigation Configuration
 * Full access navigation for admin users
 */
const adminNavigationConfig: IdeomniNavItemType[] = [
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
	}
];

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
 * Get navigation configuration based on user type
 */
export function getNavigationConfig(userType: 'admin' | 'user' | null): IdeomniNavItemType[] {
	if (userType === 'admin') {
		return adminNavigationConfig;
	}
	if (userType === 'user') {
		return userNavigationConfig;
	}
	// Return empty array for unauthenticated users
	return [];
}

/**
 * Default navigation configuration (for backward compatibility)
 * This will be replaced by role-based configs
 */
const navigationConfig: IdeomniNavItemType[] = adminNavigationConfig;

export default navigationConfig;
export { adminNavigationConfig, userNavigationConfig };
