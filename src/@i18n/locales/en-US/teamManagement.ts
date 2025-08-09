const teamManagement = {
  // Navigation & Headers
  TEAM_MANAGEMENT: 'Team Management',
  TEAM_DASHBOARD: 'Team Dashboard',
  BROWSE_TEAMS: 'Browse Teams',
  CREATE_TEAM: 'Create Team',
  TEAM_SETTINGS: 'Team Settings',
  
  // Team Card Component
  OPEN: 'Open',
  CLOSED: 'Closed',
  FULL: 'Full',
  MEMBERS: 'members',
  TEAM_LEADER: 'Team Leader',
  CREATED: 'Created',
  VIEW_DETAILS: 'View Details',
  JOIN: 'Join',
  JOINING: 'Joining...',
  ACTIONS: 'Actions',
  AVAILABLE_SPOT: 'Available spot',
  
  // Create Team Form
  CREATE_NEW_TEAM: 'Create New Team',
  CREATE_TEAM_SUBTITLE: 'Set up a new team and start collaborating with others',
  BACK: 'Back',
  TEAM_NAME: 'Team Name',
  TEAM_NAME_PLACEHOLDER: 'Enter team name',
  DESCRIPTION_OPTIONAL: 'Description (Optional)',
  DESCRIPTION_PLACEHOLDER: 'Describe your team\'s purpose and goals',
  DESCRIPTION_CHAR_COUNT: 'characters',
  MAXIMUM_MEMBERS: 'Maximum Members',
  TEAM_WILL_ALLOW: 'Team will allow up to',
  OPEN_TEAM: 'Open Team',
  OPEN_TEAM_DESCRIPTION: 'Allow others to discover and join your team',
  CREATING_TEAM: 'Creating Team...',
  
  // Team Creation Guidelines
  TEAM_CREATION_GUIDELINES: 'Team Creation Guidelines',
  GUIDELINE_ONE_TEAM: '• You can only create one team per activity',
  GUIDELINE_AUTO_LEADER: '• You will automatically become the team leader',
  GUIDELINE_UNIQUE_NAME: '• Team names must be unique within your activity',
  GUIDELINE_CHANGE_SETTINGS: '• You can change team settings later if needed',
  
  // Browse Teams
  DISCOVER_JOIN_TEAMS: 'Discover and join teams in your activity',
  SEARCH_TEAMS_PLACEHOLDER: 'Search teams by name or description...',
  SEARCH: 'Search',
  FOUND_TEAMS: 'Found',
  TEAMS: 'teams',
  FAILED_TO_LOAD_TEAMS: 'Failed to load teams',
  FAILED_TO_LOAD_TEAMS_MESSAGE: 'There was an error loading available teams. Please try again.',
  NO_TEAMS_FOUND: 'No teams found',
  NO_TEAMS_ADJUST_SEARCH: 'Try adjusting your search terms',
  NO_TEAMS_AVAILABLE: 'There are no available teams at the moment',
  CREATE_NEW_TEAM_BUTTON: 'Create New Team',
  CANT_FIND_RIGHT_TEAM: 'Can\'t find the right team?',
  CREATE_OWN_TEAM_MESSAGE: 'Create your own team and invite others to join',
  
  // Team Member List
  TEAM_MEMBERS: 'Team Members',
  LEADER: 'Leader',
  JOINED: 'Joined',
  MANAGER: 'Manager',
  WORKER: 'Worker',
  STUDENT: 'Student',
  
  // Form Validation Messages
  TEAM_NAME_REQUIRED: 'Team name is required',
  TEAM_NAME_MIN_LENGTH: 'Team name must be at least 1 character',
  TEAM_NAME_MAX_LENGTH: 'Team name must be at most 50 characters',
  DESCRIPTION_MAX_LENGTH: 'Description must be at most 200 characters',
  MAX_MEMBERS_REQUIRED: 'Maximum members is required',
  MIN_MEMBERS: 'Team must allow at least 2 members',
  MAX_MEMBERS_LIMIT: 'Team cannot have more than 20 members',
  
  // Error Messages
  FAILED_TO_CREATE_TEAM: 'Failed to create team. Please try again.',
  FAILED_TO_JOIN_TEAM: 'Failed to join team',
  
  // Success Messages
  TEAM_CREATED_SUCCESSFULLY: 'Team created successfully',
  JOINED_TEAM_SUCCESSFULLY: 'Joined team successfully',
  
  // Status Labels
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
  
  // Team Dashboard
  MANAGE_TEAM_COLLABORATION: 'Manage your team collaboration and activities',
  NOT_IN_TEAM_YET: 'You\'re not in a team yet',
  JOIN_OR_CREATE_TEAM: 'Join an existing team or create a new one to start collaborating',
  BROWSE_TEAMS_BUTTON: 'Browse Teams',
  CREATE_TEAM_BUTTON: 'Create Team',
  TEAM_INFORMATION: 'Team Information',
  OPEN_TO_NEW_MEMBERS: 'Open to new members',
  CLOSED_TEAM: 'Closed team',
  INVITE_MEMBERS: 'Invite Members',
  QUICK_ACTIONS: 'Quick Actions',
  BROWSE_OTHER_TEAMS: 'Browse Other Teams',
  SETTINGS: 'Settings',
  TEAM_DASHBOARD_FALLBACK: 'Team Dashboard',
  
  // Resource Transfers
  RESOURCE_TRANSFERS: 'Resource Transfers',
  TRANSFER_HUB: 'Transfer Hub',
  TRANSFER_GOLD: 'Transfer Gold',
  TRANSFER_CARBON: 'Transfer Carbon Emission Index',
  SEND_RESOURCES: 'Send Resources',
  SEND_RESOURCES_SUBTITLE: 'Transfer gold and carbon emission index to other teams in your activity',
  TRANSFER_RESOURCES_TO_TEAMS: 'Transfer resources to other teams',
  SELECT_TRANSFER_TYPE: 'Select what you want to transfer',
  GOLD_TRANSFERS: 'Gold Transfers',
  CARBON_TRANSFERS: 'Carbon Emission Index Transfers',
  RECENT_TRANSFERS: 'Recent Transfers',
  QUICK_TRANSFER: 'Quick Transfer',
  
  // Transfer Forms
  TRANSFER_GOLD_TO_TEAM: 'Transfer Gold to Team',
  TRANSFER_CARBON_TO_TEAM: 'Transfer Carbon Emission Index to Team',
  TRANSFER_GOLD_SUBTITLE: 'Send gold from your team account to another team',
  TRANSFER_CARBON_SUBTITLE: 'Send carbon emission index from your team account to another team',
  SELECT_TARGET_TEAM: 'Select Target Team',
  SELECT_TEAM_PLACEHOLDER: 'Choose a team to transfer to...',
  TRANSFER_AMOUNT: 'Transfer Amount',
  AMOUNT_PLACEHOLDER: 'Enter amount to transfer',
  AVAILABLE_BALANCE: 'Available Balance',
  TRANSFER_DESCRIPTION: 'Description (Optional)',
  TRANSFER_DESCRIPTION_PLACEHOLDER: 'Add a note about this transfer...',
  SEND_TRANSFER: 'Send Transfer',
  SENDING_TRANSFER: 'Sending Transfer...',
  CANCEL_TRANSFER: 'Cancel',
  CONFIRM_TRANSFER: 'Confirm Transfer',
  TRANSFER_CONFIRMATION: 'Transfer Confirmation',
  REVIEW_TRANSFER_DETAILS: 'Please review the transfer details below',
  TARGET_TEAM: 'Target Team',
  AMOUNT: 'Amount',
  DESCRIPTION: 'Description',
  CURRENT_BALANCE: 'Current Balance',
  BALANCE_AFTER_TRANSFER: 'Balance After Transfer',
  
  // Transfer Validation
  INVALID_AMOUNT: 'Please enter a valid amount',
  AMOUNT_TOO_SMALL: 'Minimum transfer amount is 0.001',
  AMOUNT_TOO_LARGE: 'Amount exceeds available balance',
  MAX_DECIMAL_PLACES: 'Maximum 3 decimal places allowed',
  TARGET_TEAM_REQUIRED: 'Please select a target team',
  LARGE_TRANSFER_WARNING: 'This transfer is more than 50% of your current balance',
  INSUFFICIENT_BALANCE_ERROR: 'Insufficient balance for this transfer',
  SAME_TEAM_ERROR: 'Cannot transfer to the same team',
  
  // Transfer Success/Error Messages
  TRANSFER_SUCCESSFUL: 'Transfer completed successfully',
  TRANSFER_FAILED: 'Transfer failed',
  GOLD_TRANSFER_SUCCESS: 'Gold transfer completed successfully',
  CARBON_TRANSFER_SUCCESS: 'Carbon emission index transfer completed successfully',
  TRANSFER_ERROR_GENERIC: 'Failed to complete transfer. Please try again.',
  
  // Account History
  ACCOUNT_HISTORY: 'Account History',
  HISTORY_OVERVIEW: 'History Overview',
  ALL_OPERATIONS: 'All Operations',
  TRANSFER_HISTORY: 'Transfer History',
  BALANCE_HISTORY: 'Balance History',
  VIEW_ACCOUNT_HISTORY: 'View Account History',
  TRACK_ALL_OPERATIONS: 'Track all your team\'s account operations and transfers',
  
  // History Dashboard
  OPERATION_SUMMARY: 'Operation Summary',
  RESOURCE_FLOW_ANALYSIS: 'Resource Flow Analysis',
  TOP_TRANSFER_PARTNERS: 'Top Transfer Partners',
  BALANCE_TRENDS: 'Balance Trends',
  RECENT_ACTIVITY: 'Recent Activity',
  TOTAL_OPERATIONS: 'Total Operations',
  GOLD_FLOW: 'Gold Flow',
  CARBON_FLOW: 'Carbon Emission Index Flow',
  NET_FLOW: 'Net Flow',
  TOTAL_IN: 'Total In',
  TOTAL_OUT: 'Total Out',
  NO_OPERATIONS_YET: 'No operations yet',
  START_BY_MAKING_TRANSFER: 'Start by making your first transfer',
  
  // Operation Types
  ACCOUNT_CREATED: 'Account Created',
  OUTGOING_TRANSFER: 'Outgoing Transfer',
  INCOMING_TRANSFER: 'Incoming Transfer',
  MANAGER_ADJUSTMENT: 'Manager Adjustment',
  SYSTEM_GRANT: 'System Grant',
  SYSTEM_DEDUCTION: 'System Deduction',
  ACTIVITY_REWARD: 'Activity Reward',
  FACILITY_INCOME: 'Facility Income',
  FACILITY_EXPENSE: 'Facility Expense',
  
  // History Filters
  FILTER_OPERATIONS: 'Filter Operations',
  OPERATION_TYPE: 'Operation Type',
  RESOURCE_TYPE: 'Resource Type',
  TRANSFER_DIRECTION: 'Transfer Direction', 
  DATE_RANGE: 'Date Range',
  FROM_DATE: 'From Date',
  TO_DATE: 'To Date',
  ALL_TYPES: 'All Types',
  ALL_RESOURCES: 'All Resources',
  ALL_DIRECTIONS: 'All Directions',
  INCOMING: 'Incoming',
  OUTGOING: 'Outgoing',
  GOLD: 'Gold',
  CARBON: 'Carbon Emission Index',
  APPLY_FILTERS: 'Apply Filters',
  CLEAR_FILTERS: 'Clear Filters',
  SEARCH_OPERATIONS: 'Search operations...',
  
  // History Tables
  DATE: 'Date',
  TYPE: 'Type',
  RESOURCE: 'Resource',
  PARTNER_TEAM: 'Partner Team',
  BALANCE_BEFORE: 'Balance Before',
  BALANCE_AFTER: 'Balance After',
  CHANGE: 'Change',
  OPERATION_ID: 'Operation ID',
  USER: 'User',
  NO_OPERATIONS_FOUND: 'No operations found',
  NO_TRANSFERS_FOUND: 'No transfers found',
  NO_BALANCE_CHANGES_FOUND: 'No balance changes found',
  LOAD_MORE: 'Load More',
  LOADING: 'Loading...',
  
  // Pagination
  PAGE: 'Page',
  OF: 'of',
  SHOWING: 'Showing',
  TO: 'to',
  ENTRIES: 'entries',
  
  // Chart Labels
  GOLD_BALANCE: 'Gold Balance',
  CARBON_BALANCE: 'Carbon Emission Index Balance',
  OPERATIONS_BY_TYPE: 'Operations by Type',
  RESOURCE_FLOW_CHART: 'Resource Flow',
  BALANCE_TREND_CHART: 'Balance Trend',
  
  // Quick Actions on Dashboard
  TRANSFER_RESOURCES: 'Transfer Resources',
  VIEW_HISTORY: 'View History',
  SEND_GOLD: 'Send Gold',
  SEND_CARBON: 'Send Carbon Emission Index',
  
  // Team Selection
  SEARCH_TEAMS: 'Search teams...',
  NO_TEAMS_AVAILABLE_FOR_TRANSFER: 'No teams available for transfer',
  TEAM_NOT_FOUND: 'Team not found',
  LOADING_TEAMS: 'Loading teams...',
  
  // Decimal Formatting
  GOLD_SYMBOL: '🪙',
  CARBON_SYMBOL: '🌿',
  
  // Time Formatting
  JUST_NOW: 'Just now',
  MINUTES_AGO: 'minutes ago',
  HOURS_AGO: 'hours ago',
  DAYS_AGO: 'days ago',
  WEEKS_AGO: 'weeks ago',
  MONTHS_AGO: 'months ago',
  
  // Export Features
  EXPORT_HISTORY: 'Export History',
  EXPORT_TO_CSV: 'Export to CSV',
  EXPORT_TO_PDF: 'Export to PDF',
  GENERATING_EXPORT: 'Generating export...',
  EXPORT_COMPLETE: 'Export complete',
  EXPORT_FAILED: 'Export failed',
  
  // Additional Terms
  LAST_30_DAYS: 'Last 30 Days',
  TRANSFERS: 'transfers',
  DIRECTION: 'Direction',
  FROM: 'from',
  SUCCESS: 'Success',
  
  // Dashboard Specific
  SAVE_CHANGES: 'Save Changes',
  SAVING_CHANGES: 'Saving Changes...',
  SEND_RESOURCES_TO_MEMBERS: 'Send resources to team members',
  REVIEW_TEAM_TRANSACTIONS: 'Review team transactions',
  TRANSFER_GOLD_RESOURCES: 'Transfer gold resources',
  TRANSFER_CARBON_CREDITS: 'Transfer carbon credits',
  JOIN_THIS_TEAM: 'Join This Team',
  JOINING_TEAM: 'Joining Team...',
  TEAM_IS_FULL: 'Team is Full',
  TEAM_IS_CLOSED: 'Team is Closed',
  
  // Balance and Transfer
  NO_GOLD_TO_TRANSFER: 'You don\'t have any gold to transfer. Your current balance is',
  TO_TEAM: 'To',
  FROM_TEAM: 'From',
  RELATED_OPERATION: 'Related Operation',
  
  // Team Ownership
  TEAM_OWNERSHIP: 'Team Ownership',
  
  // Team Account Card
  TEAM_RESOURCES: 'Team Resources', 
  CARBON_CREDITS: 'Carbon Credits',
  ALL_RESOURCES_AVAILABLE: 'All resources available',
  NO_RESOURCES_AVAILABLE: 'No resources available',
  LIMITED_RESOURCES_AVAILABLE: 'Limited resources available',
  TEAM_NAME: 'Team Name',
  LAST_UPDATED: 'Last updated'
};

export default teamManagement;