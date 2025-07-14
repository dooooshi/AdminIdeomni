import i18n from '@i18n';
import { IdeomniNavItemType } from '@ideomni/core/IdeomniNavigation/types/IdeomniNavItemType';
import { enUS, zhCN } from '@i18n/locales';

// Add navigation translations to i18n
i18n.addResourceBundle('en-US', 'navigation', enUS.navigation);
i18n.addResourceBundle('zh-CN', 'navigation', zhCN.navigation);

/**
 * The navigationConfig object is an array of navigation items for the Ideomni application.
 */
const navigationConfig: IdeomniNavItemType[] = [
	{
		id: 'map',
		title: 'Map',
		subtitle: 'Map applications and tools',
		type: 'group',
		icon: 'heroicons-outline:map',
		translate: 'MAP',
		children: [
			{
				id: 'map.test-map',
				title: 'Test Map',
				type: 'item',
				icon: 'heroicons-outline:beaker',
				url: '/map',
				translate: 'TEST_MAP'
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
		children: [
			{
				id: 'dashboards.project',
				title: 'Project',
				type: 'item',
				icon: 'heroicons-outline:clipboard-document-check',
				url: '/dashboards/project',
				translate: 'PROJECT'
			},
			{
				id: 'dashboards.analytics',
				title: 'Analytics',
				type: 'item',
				icon: 'heroicons-outline:chart-pie',
				url: '/dashboards/analytics',
				translate: 'ANALYTICS'
			},
			{
				id: 'dashboards.finance',
				title: 'Finance',
				type: 'item',
				icon: 'heroicons-outline:banknotes',
				url: '/dashboards/finance',
				translate: 'FINANCE'
			},
			{
				id: 'dashboards.crypto',
				title: 'Crypto',
				type: 'item',
				icon: 'heroicons-outline:currency-dollar',
				url: '/dashboards/crypto',
				translate: 'CRYPTO'
			},
			{
				id: 'apps.ecommerce',
				title: 'ECommerce',
				type: 'collapse',
				icon: 'heroicons-outline:shopping-cart',
				translate: 'ECOMMERCE',
				children: [
					{
						id: 'e-commerce-products',
						title: 'Products',
						type: 'item',
						url: '/apps/e-commerce/products',
						end: true,
						translate: 'PRODUCTS'
					},
					{
						id: 'e-commerce-product-detail',
						title: 'Product Detail',
						type: 'item',
						url: '/apps/e-commerce/products/1/a-walk-amongst-friends-canvas-print',
						translate: 'PRODUCT_DETAIL'
					},
					{
						id: 'e-commerce-new-product',
						title: 'New Product',
						type: 'item',
						url: '/apps/e-commerce/products/new',
						translate: 'NEW_PRODUCT'
					},
					{
						id: 'e-commerce-orders',
						title: 'Orders',
						type: 'item',
						url: '/apps/e-commerce/orders',
						end: true,
						translate: 'ORDERS'
					},
					{
						id: 'e-commerce-order-detail',
						title: 'Order Detail',
						type: 'item',
						url: '/apps/e-commerce/orders/1',
						translate: 'ORDER_DETAIL'
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
				children: [
					{
						id: 'apps.help-center.home',
						title: 'Home',
						type: 'item',
						url: '/apps/help-center',
						end: true,
						translate: 'HOME'
					},
					{
						id: 'apps.help-center.faqs',
						title: 'FAQs',
						type: 'item',
						url: '/apps/help-center/faqs',
						translate: 'FAQS'
					},
					{
						id: 'apps.help-center.guides',
						title: 'Guides',
						type: 'item',
						url: '/apps/help-center/guides',
						translate: 'GUIDES'
					},
					{
						id: 'apps.help-center.support',
						title: 'Support',
						type: 'item',
						url: '/apps/help-center/support',
						translate: 'SUPPORT'
					}
				]
			},
			{
				id: 'apps.notifications',
				title: 'Notifications',
				type: 'item',
				icon: 'heroicons-outline:bell',
				url: '/apps/notifications',
				translate: 'NOTIFICATIONS'
			},
			{
				id: 'pages.activities',
				title: 'Activities',
				type: 'item',
				icon: 'heroicons-outline:bars-3-bottom-left',
				url: '/pages/activities',
				translate: 'ACTIVITIES'
			},

		]
	},

];

export default navigationConfig;
