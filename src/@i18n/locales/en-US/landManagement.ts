const landManagement = {
  // General Terms
  LAND_MANAGEMENT: 'Land Management',
  LAND: 'Land',
  TILE: 'Tile',
  TILES: 'Tiles',
  AREA: 'Area',
  OWNERSHIP: 'Ownership',
  PURCHASE: 'Purchase',
  PURCHASES: 'Purchases',
  COST: 'Cost',
  PRICE: 'Price',
  AVAILABLE: 'Available',
  OWNED: 'Owned',
  TEAM: 'Team',
  TEAMS: 'Teams',
  
  // Land Types
  PLAIN: 'Plain',
  COASTAL: 'Coastal',
  MARINE: 'Marine',
  LAND_TYPE: 'Land Type',
  
  // Purchase Status
  ACTIVE: 'Active',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  STATUS: 'Status',
  
  // Currency
  GOLD: 'Gold',
  CARBON: 'Carbon',
  GOLD_COST: 'Gold Cost',
  CARBON_COST: 'Carbon Cost',
  TOTAL_COST: 'Total Cost',
  BALANCE: 'Balance',
  SPENT: 'Spent',
  
  // Manager Pages
  MANAGER_MAP_VIEW: 'Manager Map View',
  MANAGER_OVERVIEW: 'Manager Overview',
  MANAGER_ANALYTICS: 'Manager Analytics',
  ACTIVITY_LAND_OVERVIEW: 'Activity Land Overview',
  LAND_ANALYTICS_DASHBOARD: 'Land Analytics Dashboard',
  
  // Student Pages
  STUDENT_MAP_VIEW: 'Land Map',
  STUDENT_PORTFOLIO: 'Land Portfolio',
  TEAM_LAND_PORTFOLIO: 'Team Land Portfolio',
  TEAM_LAND_MANAGEMENT: 'Team Land Management',
  
  // Map Interface
  MAP_VIEW: 'Map View',
  INTERACTIVE_MAP: 'Interactive Map',
  MAP_LEGEND: 'Map Legend',
  ZOOM_IN: 'Zoom In',
  ZOOM_OUT: 'Zoom Out',
  RESET_ZOOM: 'Reset Zoom',
  REFRESH_DATA: 'Refresh Data',
  ENABLE_ANIMATIONS: 'Enable Land Animations',
  DISABLE_ANIMATIONS: 'Disable Land Animations',
  
  // Purchase Interface
  PURCHASE_LAND: 'Purchase Land',
  PURCHASE_DIALOG_TITLE: 'Purchase Land - Tile {tileId}',
  TILE_INFORMATION: 'Tile Information',
  YOUR_HOLDINGS: 'Your Holdings',
  AREA_TO_PURCHASE: 'Area to Purchase',
  PURCHASE_AMOUNT: 'Purchase Amount',
  AMOUNT_UNITS: 'Amount (units)',
  AMOUNT_HELPER_TEXT: 'Enter amount between 1 and 1,000 units',
  PURCHASE_SUMMARY: 'Purchase Summary',
  INVESTMENT_ANALYSIS: 'Investment Analysis',
  PRICE_PROTECTION: 'Price Protection',
  ENABLE_PRICE_PROTECTION: 'Enable Price Protection',
  MAX_GOLD_COST: 'Max Gold Cost',
  MAX_CARBON_COST: 'Max Carbon Cost',
  PURCHASE_DESCRIPTION: 'Purchase Description (Optional)',
  NOTES_OPTIONAL: 'Notes (optional)',
  NOTES_PLACEHOLDER: 'Add notes about this purchase...',
  CONFIRM_PURCHASE: 'Confirm Purchase',
  PURCHASING: 'Purchasing...',
  PURCHASE_UNITS: 'Purchase {amount} Units',
  PURCHASE_COMPLETE: 'Purchase Complete',
  PURCHASE_FAILED: 'Purchase Failed',
  CAN_PURCHASE: 'Can Purchase',
  CANNOT_PURCHASE: 'Cannot Purchase',
  PURCHASE_AVAILABLE: 'Purchase Available',
  
  // Ownership Details
  OWNED_AREA: 'Owned Area',
  TOTAL_OWNED_AREA: 'Total Owned Area',
  AVAILABLE_AREA: 'Available Area',
  TEAM_OWNED_AREA: 'Team Owned Area',
  OWNERSHIP_PERCENTAGE: 'Ownership Percentage',
  OWNERSHIP_BREAKDOWN: 'Ownership Breakdown',
  
  // Financial Information
  TOTAL_INVESTMENT: 'Total Investment',
  TOTAL_SPENT: 'Total Spent',
  TOTAL_GOLD_SPENT: 'Total Gold Spent',
  TOTAL_CARBON_SPENT: 'Total Carbon Spent',
  AVERAGE_COST_PER_AREA: 'Average Cost per Area',
  INVESTMENT_BREAKDOWN: 'Investment Breakdown',
  REVENUE: 'Revenue',
  TOTAL_REVENUE: 'Total Revenue',
  
  // History and Timeline
  PURCHASE_HISTORY: 'Purchase History',
  PURCHASE_DATE: 'Purchase Date',
  FIRST_PURCHASE: 'First Purchase',
  LATEST_PURCHASE: 'Latest Purchase',
  LAST_PURCHASE_DATE: 'Last Purchase Date',
  ACTIVITY_TIMELINE: 'Activity Timeline',
  ACTIVITY_PERIOD: 'Activity Period',
  ACTIVE_DAYS: 'Active Days',
  DAYS_SINCE_FIRST: 'Days Since First Purchase',
  
  // Statistics and Analytics
  TOTAL_PURCHASES: 'Total Purchases',
  TOTAL_TILES: 'Total Tiles',
  TILES_OWNED: 'Tiles Owned',
  TILES_WITH_OWNERSHIP: 'Tiles with Ownership',
  TEAMS_WITH_LAND: 'Teams with Land',
  AVERAGE_AREA_PER_TEAM: 'Average Area per Team',
  MOST_ACTIVE_TILE: 'Most Active Tile',
  TOP_TEAM_BY_AREA: 'Top Team by Area',
  LEADING_TEAM: 'Leading Team',
  TOP_PERFORMER: 'Top Performer',
  
  // Performance Indicators
  PERFORMANCE_LEVEL: 'Performance Level',
  HIGH_IMPACT: 'High Impact',
  MODERATE_IMPACT: 'Moderate Impact',
  LOW_IMPACT: 'Low Impact',
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  AVERAGE: 'Average',
  
  // Charts and Analytics
  PURCHASE_TRENDS: 'Purchase Trends',
  PURCHASE_TRENDS_OVER_TIME: 'Purchase Trends Over Time',
  LAND_TYPE_DISTRIBUTION: 'Land Type Distribution',
  REVENUE_BY_LAND_TYPE: 'Revenue by Land Type',
  TOP_PERFORMING_TILES: 'Top Performing Tiles',
  TEAM_RANKINGS: 'Team Rankings',
  TEAM_PERFORMANCE_RANKINGS: 'Team Performance Rankings',
  
  // Filters and Controls
  FILTERS: 'Filters',
  SHOW_FILTERS: 'Show Filters',
  HIDE_FILTERS: 'Hide Filters',
  APPLY_FILTERS: 'Apply Filters',
  CLEAR_FILTERS: 'Clear Filters',
  SHOW_ONLY_AVAILABLE: 'Show Only Available',
  SHOW_ONLY_OWNED: 'Show Only Owned',
  MIN_PRICE: 'Min Price',
  MAX_PRICE: 'Max Price',
  MIN_AVAILABLE_AREA: 'Min Available Area',
  TIME_RANGE: 'Time Range',
  THIS_WEEK: 'This Week',
  THIS_MONTH: 'This Month',
  ALL_TIME: 'All Time',
  START_DATE: 'Start Date',
  END_DATE: 'End Date',
  
  // Actions
  VIEW_DETAILS: 'View Details',
  VIEW_TEAM: 'View Team',
  EXPORT_DATA: 'Export Data',
  RETRY: 'Retry',
  CANCEL: 'Cancel',
  CLOSE: 'Close',
  
  // Messages and Status
  LOADING: 'Loading...',
  NO_DATA_AVAILABLE: 'No data available',
  NO_TEAM_DATA: 'No team portfolio data available. Join a team to start purchasing land.',
  NO_PURCHASES_FOUND: 'No purchase history found',
  NO_ANALYTICS_DATA: 'No analytics data available for this activity.',
  NO_RECENT_PURCHASES: 'No recent purchases to display',
  CALCULATING_COSTS: 'Calculating costs...',
  
  // Error Messages
  FAILED_TO_LOAD: 'Failed to load data',
  PURCHASE_VALIDATION_FAILED: 'Purchase validation failed',
  INSUFFICIENT_RESOURCES: 'Insufficient team resources for purchase',
  TILE_NOT_FOUND: 'Tile not found in current activity',
  PRICE_PROTECTION_EXCEEDED: 'Purchase cost exceeds maximum price limits',
  INVALID_AREA_AMOUNT: 'Invalid area amount for purchase',
  
  // Descriptions
  MANAGER_MAP_DESCRIPTION: 'Interactive map showing land ownership across all teams in your activity. Click on tiles to view detailed ownership information.',
  STUDENT_MAP_DESCRIPTION: 'Discover premium land opportunities and make strategic investments. Click on tiles to explore details, compare prices, and secure your land.',
  PORTFOLIO_DESCRIPTION: 'Manage and monitor your team\'s land ownership and purchase history',
  OVERVIEW_DESCRIPTION: 'Comprehensive overview of land activities in {activityName}',
  ANALYTICS_DESCRIPTION: 'Comprehensive analytics and insights for land management activities',
  
  // Tooltips and Help Text
  AREA_TOOLTIP: 'The amount of land area to purchase (0.001 to 100 units)',
  PRICE_PROTECTION_TOOLTIP: 'Set maximum costs to protect against sudden price increases',
  OWNERSHIP_PERCENTAGE_TOOLTIP: 'Percentage of total tile area owned by this team',
  UTILIZATION_RATE_TOOLTIP: 'Percentage of total available land that has been purchased',
  
  // Validation Messages
  AREA_MUST_BE_POSITIVE: 'Area must be greater than 0',
  AREA_CANNOT_EXCEED_MAX: 'Area cannot exceed {max} units',
  AREA_DECIMAL_PLACES: 'Area can have at most 3 decimal places',
  MAX_COST_CANNOT_BE_NEGATIVE: 'Maximum cost cannot be negative',
  
  // Success Messages
  LAND_PURCHASED_SUCCESSFULLY: 'Land purchased successfully!',
  DATA_REFRESHED: 'Data refreshed successfully',
  FILTERS_APPLIED: 'Filters applied successfully',
  
  // Table Headers
  DATE: 'Date',
  TILE_ID: 'Tile ID',
  DESCRIPTION: 'Description',
  RANK: 'Rank',
  TEAM_NAME: 'Team Name',
  TOTAL_AREA: 'Total Area',
  PURCHASE_COUNT: 'Purchase Count',
  AVG_COST_AREA: 'Avg Cost/Area',
  PERFORMANCE: 'Performance',
  
  // Units and Formatting
  AREA_UNIT: 'sq units',
  AREA_UNITS: 'units',
  CURRENCY_UNIT: '',
  PERCENTAGE_UNIT: '%',
  DAYS_UNIT: 'days',
  PURCHASES_UNIT: 'purchases',
  
  // Context Menu Actions
  QUICK_PURCHASE: 'Quick Purchase',
  PURCHASE_MAX_AVAILABLE: 'Purchase Max Available',
  VIEW_DETAILS: 'View Details',
  CALCULATE_COST: 'Calculate Cost',
  VIEW_TILE_INFORMATION: 'View tile information and ownership',
  ESTIMATE_PURCHASE_COST: 'Estimate purchase cost for different areas',
  PURCHASE_UNAVAILABLE: 'Purchase Unavailable',
  ALREADY_OWNED_BY_TEAM: 'This tile is already owned by your team',
  NOT_AVAILABLE_FOR_PURCHASE: 'This tile is not available for purchase',
  BUY: 'Buy',
};

export default landManagement;