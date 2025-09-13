import { IdeomniNavItemType } from '@ideomni/core/IdeomniNavigation/types/IdeomniNavItemType';


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
		translateSubtitle: 'ADMIN_MANAGEMENT_SUBTITLE',
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
			{
				id: 'admin-management.admin-user-activity',
				title: 'Admin User-Activity Management',
				type: 'item',
				icon: 'heroicons-outline:users',
				url: '/admin-user-activity',
				translate: 'ADMIN_USER_ACTIVITY_MANAGEMENT',
				auth: ['admin']
			},
			{
				id: 'admin-management.facility-management',
				title: 'Facility Management',
				type: 'item',
				icon: 'heroicons-outline:building-office-2',
				url: '/facility-management',
				translate: 'FACILITY_MANAGEMENT',
				auth: ['admin']
			},
			{
				id: 'admin-management.craft-category-management',
				title: 'Craft Category Management',
				type: 'item',
				icon: 'heroicons-outline:cog-6-tooth',
				url: '/craft-category-management',
				translate: 'CRAFT_CATEGORY_MANAGEMENT',
				auth: ['admin']
			},
			{
				id: 'admin-management.raw-materials',
				title: 'Raw Materials',
				type: 'item',
				icon: 'heroicons-outline:cube',
				url: '/raw-materials',
				translate: 'RAW_MATERIALS',
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
		translateSubtitle: 'MAP_APPLICATIONS_SUBTITLE',
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
		id: 'admin-management',
		title: 'Admin Management',
		subtitle: 'Basic admin features',
		type: 'group',
		icon: 'heroicons-outline:shield-check',
		translate: 'ADMIN_MANAGEMENT',
		translateSubtitle: 'BASIC_ADMIN_SUBTITLE',
		auth: ['admin'],
		children: [
			{
				id: 'admin-management.facility-management',
				title: 'Facility Management',
				type: 'item',
				icon: 'heroicons-outline:building-office-2',
				url: '/facility-management',
				translate: 'FACILITY_MANAGEMENT',
				auth: ['admin']
			},
			{
				id: 'admin-management.raw-materials',
				title: 'Raw Materials',
				type: 'item',
				icon: 'heroicons-outline:cube',
				url: '/raw-materials',
				translate: 'RAW_MATERIALS',
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
		translateSubtitle: 'MAP_APPLICATIONS_SUBTITLE',
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
			}
		]
	},
	
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
		translateSubtitle: 'PROJECT_MANAGEMENT_SUBTITLE',
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
	},
	{
		id: 'team-management',
		title: 'Team Management',
		subtitle: 'Collaborate with your team',
		type: 'group',
		icon: 'heroicons-outline:user-group',
		translate: 'TEAM_MANAGEMENT',
		translateSubtitle: 'TEAM_COLLABORATION_SUBTITLE',
		auth: ['user'],
		children: [
			{
				id: 'team-management.dashboard',
				title: 'Team Dashboard',
				type: 'item',
				icon: 'heroicons-outline:home',
				url: '/team-management/dashboard',
				translate: 'TEAM_DASHBOARD',
				auth: ['user']
			},
			{
				id: 'team-management.browse',
				title: 'Browse Teams',
				type: 'item',
				icon: 'heroicons-outline:magnifying-glass',
				url: '/team-management/browse',
				translate: 'BROWSE_TEAMS',
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
	adminType?: 1 | 2,
	regularUserType?: 1 | 2 | 3
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
		return getUserNavigationConfig(regularUserType);
	}
	// Return empty array for unauthenticated users
	return [];
}

/**
 * Get user navigation configuration based on user type
 */
export function getUserNavigationConfig(regularUserType?: 1 | 2 | 3): IdeomniNavItemType[] {
	let navigation: IdeomniNavItemType[] = [];
	
	// Add Dashboard only for coordinators (userType: 2)
	if (regularUserType === 2) {
		navigation.push({
			id: 'dashboards',
			title: 'Dashboards',
			subtitle: 'Project management',
			type: 'group',
			icon: 'heroicons-outline:home',
			translate: 'DASHBOARDS',
			translateSubtitle: 'PROJECT_MANAGEMENT_SUBTITLE',
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
		});
	}


	// Add Team Management (Collaborate with your team) only for Students (userType: 3)
	if (regularUserType === 3) {
		navigation.push({
			id: 'team-management',
			title: 'Team Management',
			subtitle: 'Collaborate with your team',
			type: 'group',
			icon: 'heroicons-outline:user-group',
			translate: 'TEAM_MANAGEMENT',
			translateSubtitle: 'TEAM_COLLABORATION_SUBTITLE',
			auth: ['user'],
			children: [
				{
					id: 'team-management.dashboard',
					title: 'Team Dashboard',
					type: 'item',
					icon: 'heroicons-outline:home',
					url: '/team-management/dashboard',
					translate: 'TEAM_DASHBOARD',
					auth: ['user']
				},
				{
					id: 'team-management.browse',
					title: 'Browse Teams',
					type: 'item',
					icon: 'heroicons-outline:magnifying-glass',
					url: '/team-management/browse',
					translate: 'BROWSE_TEAMS',
					auth: ['user']
				},
				{
					id: 'team-management.transfers',
					title: 'Resource Transfers',
					type: 'collapse',
					icon: 'heroicons-outline:arrows-right-left',
					translate: 'RESOURCE_TRANSFERS',
					auth: ['user'],
					children: [
						{
							id: 'team-management.transfers.hub',
							title: 'Transfer Hub',
							type: 'item',
							icon: 'heroicons-outline:home',
							url: '/team-management/transfers',
							translate: 'TRANSFER_HUB',
							auth: ['user']
						},
						{
							id: 'team-management.transfers.gold',
							title: 'Transfer Gold',
							type: 'item',
							icon: 'heroicons-outline:currency-dollar',
							url: '/team-management/transfers/gold',
							translate: 'TRANSFER_GOLD',
							auth: ['user']
						},
						{
							id: 'team-management.transfers.carbon',
							title: 'Transfer Carbon',
							type: 'item',
							icon: 'heroicons-outline:leaf',
							url: '/team-management/transfers/carbon',
							translate: 'TRANSFER_CARBON',
							auth: ['user']
						},
						{
							id: 'team-management.transfers.transportation',
							title: 'transportation.FACILITY_TRANSPORTATION',
							type: 'item',
							icon: 'heroicons-outline:truck',
							url: '/team-management/transportation',
							translate: 'transportation.FACILITY_TRANSPORTATION',
							auth: ['user']
						}
					]
				},
				{
					id: 'team-management.contracts',
					title: 'Team Contracts',
					type: 'collapse',
					icon: 'heroicons-outline:document-text',
					translate: 'TEAM_CONTRACTS',
					auth: ['user'],
					children: [
						{
							id: 'team-management.contracts.list',
							title: 'View Contracts',
							type: 'item',
							icon: 'heroicons-outline:document-duplicate',
							url: '/contract-management',
							translate: 'VIEW_CONTRACTS',
							auth: ['user']
						},
						{
							id: 'team-management.contracts.create',
							title: 'Create Contract',
							type: 'item',
							icon: 'heroicons-outline:document-plus',
							url: '/contract-management/create',
							translate: 'CREATE_CONTRACT',
							auth: ['user']
						}
					]
				},
				{
					id: 'team-management.history',
					title: 'Account History',
					type: 'collapse',
					icon: 'heroicons-outline:clock',
					translate: 'ACCOUNT_HISTORY',
					auth: ['user'],
					children: [
						{
							id: 'team-management.history.dashboard',
							title: 'History Overview',
							type: 'item',
							icon: 'heroicons-outline:chart-bar',
							url: '/team-management/history',
							translate: 'HISTORY_OVERVIEW',
							auth: ['user']
						},
						{
							id: 'team-management.history.operations',
							title: 'All Operations',
							type: 'item',
							icon: 'heroicons-outline:list-bullet',
							url: '/team-management/history/operations',
							translate: 'ALL_OPERATIONS',
							auth: ['user']
						},
						{
							id: 'team-management.history.transfers',
							title: 'Transfer History',
							type: 'item',
							icon: 'heroicons-outline:arrow-path',
							url: '/team-management/history/transfers',
							translate: 'TRANSFER_HISTORY',
							auth: ['user']
						}
					]
				}
			]
		});
	}

	// Add Land Management for Students (userType: 3)
	if (regularUserType === 3) {
		navigation.push({
			id: 'land-management',
			title: 'Land Management',
			subtitle: 'Purchase and manage team land',
			type: 'group',
			icon: 'heroicons-outline:building-office',
			translate: 'LAND_MANAGEMENT',
			translateSubtitle: 'LAND_PURCHASE_SUBTITLE',
			auth: ['user'],
			children: [
				{
					id: 'land-management.student-map',
					title: 'Land Map',
					type: 'item',
					icon: 'heroicons-outline:map',
					url: '/land-management/student/map',
					translate: 'STUDENT_MAP_VIEW',
					auth: ['user']
				},
				{
					id: 'land-management.team-land',
					title: '土地管理',
					type: 'collapse',
					icon: 'heroicons-outline:chart-bar',
					translate: 'LAND_MANAGEMENT_SUBMENU',
					auth: ['user'],
					children: [
						{
							id: 'land-management.team-land.status',
							title: '土地状态',
							type: 'item',
							icon: 'heroicons-outline:home-modern',
							url: '/land-management/student/land-status',
							translate: 'LAND_STATUS',
							auth: ['user']
						},
						{
							id: 'land-management.team-land.history',
							title: '土地交易历史',
							type: 'item',
							icon: 'heroicons-outline:clock',
							url: '/land-management/student/history',
							translate: 'LAND_TRANSACTION_HISTORY',
							auth: ['user']
						}
					]
				},
				{
					id: 'land-management.student-facilities',
					title: 'Facilities',
					type: 'collapse',
					icon: 'heroicons-outline:building-office-2',
					translate: 'STUDENT_FACILITIES',
					auth: ['user'],
					children: [
						{
							id: 'land-management.student-facilities.main',
							title: 'Facility Management',
							type: 'item',
							icon: 'heroicons-outline:building-office-2',
							url: '/land-management/student/facilities',
							translate: 'FACILITY_MANAGEMENT',
							auth: ['user']
						},
						{
							id: 'land-management.student-facilities.space',
							title: 'Facility Space Status',
							type: 'item',
							icon: 'heroicons-outline:archive-box',
							url: '/student-facility-space',
							translate: 'FACILITY_SPACE_STATUS',
							auth: ['user']
						},
						{
							id: 'land-management.student-facilities.infrastructure',
							title: 'Infrastructure Dashboard',
							type: 'item',
							icon: 'heroicons-outline:bolt',
							url: '/infrastructure',
							translate: 'INFRASTRUCTURE_DASHBOARD',
							auth: ['user']
						},
						{
							id: 'land-management.student-facilities.infrastructure-history',
							title: '基础设施历史记录',
							type: 'item',
							icon: 'heroicons-outline:clock',
							url: '/infrastructure/history',
							translate: 'INFRASTRUCTURE_HISTORY',
							auth: ['user']
						}
					]
				}
			]
		});
		
		// Add Production & Resources for Students
		navigation.push({
			id: 'production-resources',
			title: 'Production & Resources',
			subtitle: 'Manage raw material production and resource consumption',
			type: 'group',
			icon: 'heroicons-outline:beaker',
			translate: 'PRODUCTION_RESOURCES',
			translateSubtitle: 'PRODUCTION_RESOURCES_SUBTITLE',
			auth: ['user'],
			children: [
				{
					id: 'production-resources.production',
					title: 'Raw Material Production',
					type: 'item',
					icon: 'heroicons-outline:cube',
					url: '/student-production',
					translate: 'RAW_MATERIAL_PRODUCTION',
					auth: ['user']
				},
				{
					id: 'production-resources.product-formula',
					title: 'Product Formulas',
					type: 'item',
					icon: 'heroicons-outline:beaker',
					url: '/student-product-formula',
					translate: 'PRODUCT_FORMULAS',
					auth: ['user']
				},
				{
					id: 'production-resources.product-production',
					title: 'Product Production',
					type: 'item',
					icon: 'heroicons-outline:cog',
					url: '/product-production',
					translate: 'PRODUCT_PRODUCTION',
					auth: ['user']
				},
				{
					id: 'production-resources.resources',
					title: 'Resource Consumption',
					type: 'item',
					icon: 'heroicons-outline:chart-bar',
					url: '/student-resources',
					translate: 'RESOURCE_CONSUMPTION',
					auth: ['user']
				}
			]
		});
	}
	
	// Add Team Administration for Managers (userType: 1)
	if (regularUserType === 1) {
		navigation.push({
			id: 'team-administration',
			title: 'Team Administration',
			subtitle: 'Manage all teams in your activity',
			type: 'group',
			icon: 'heroicons-outline:cog-6-tooth',
			translateSubtitle: 'TEAM_ADMINISTRATION_SUBTITLE',
			translate: 'TEAM_ADMINISTRATION',
			auth: ['user'],
			children: [
				{
					id: 'team-administration.overview',
					title: 'Administration Overview',
					type: 'item',
					icon: 'heroicons-outline:chart-bar-square',
					url: '/team-administration/overview',
					translate: 'TEAM_ADMIN_OVERVIEW',
					auth: ['user']
				},
				{
					id: 'team-administration.teams',
					title: 'Manage Teams',
					type: 'item',
					icon: 'heroicons-outline:user-group',
					url: '/team-administration/teams',
					translate: 'MANAGE_TEAMS',
					auth: ['user']
				},
				{
					id: 'team-administration.accounts',
					title: 'Team Accounts',
					type: 'item',
					icon: 'heroicons-outline:currency-dollar',
					url: '/team-administration/accounts',
					translate: 'TEAM_ACCOUNTS',
					auth: ['user']
				}
			]
		});

		// Add Land Management for Managers (userType: 1)
		navigation.push({
			id: 'land-management',
			title: 'Land Management',
			subtitle: 'Oversee all land activities',
			type: 'group',
			icon: 'heroicons-outline:building-office',
			translate: 'LAND_MANAGEMENT',
			translateSubtitle: 'LAND_ACTIVITIES_SUBTITLE',
			auth: ['user'],
			children: [
				{
					id: 'land-management.manager-map',
					title: 'Manager Map View',
					type: 'item',
					icon: 'heroicons-outline:map',
					url: '/land-management/manager/map',
					translate: 'MANAGER_MAP_VIEW',
					auth: ['user']
				},
				{
					id: 'land-management.manager-overview',
					title: 'Manager Overview',
					type: 'item',
					icon: 'heroicons-outline:chart-bar',
					url: '/land-management/manager/overview',
					translate: 'MANAGER_OVERVIEW',
					auth: ['user']
				}
			]
		});
	}
	
	return navigation;
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
