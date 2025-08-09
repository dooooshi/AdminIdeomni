const adminManagement = {
	// Page titles and headers
	ADMIN_MANAGEMENT: '管理员管理',
	ADMIN_MANAGEMENT_SUBTITLE: '管理管理员账户并监控操作。',
	ADMIN_ACCOUNTS: '管理员账户',
	SYSTEM_LOGS: '系统日志',
	
	// Common actions
	CREATE_ADMIN: '创建管理员',
	EDIT_ADMIN: '编辑管理员',
	DELETE_ADMIN: '删除管理员',
	VIEW_LOGS: '查看日志',
	REFRESH_DATA: '刷新数据',
	
	// Admin List
	USERNAME: '用户名',
	EMAIL: '邮箱',
	FIRST_NAME: '名',
	LAST_NAME: '姓',
	ADMIN_TYPE: '管理员类型',
	STATUS: '状态',
	LAST_LOGIN: '最后登录',
	CREATED_AT: '创建时间',
	ACTIONS: '操作',
	ADMIN: '管理员',
	
	// Admin Types
	SUPER_ADMIN: '超级管理员',
	LIMITED_ADMIN: '有限管理员',
	ADMIN_TYPE_1: '超级管理员',
	ADMIN_TYPE_2: '有限管理员',
	
	// Status
	ACTIVE: '活跃',
	INACTIVE: '非活跃',
	
	// Filters
	SEARCH_PLACEHOLDER: '搜索管理员...',
	FILTER_BY_TYPE: '按类型筛选',
	FILTER_BY_STATUS: '按状态筛选',
	FILTER_BY_ROLE: '按角色筛选',
	ALL_TYPES: '所有类型',
	ALL_STATUSES: '所有状态',
	ALL_ROLES: '所有角色',
	
	// Statistics
	TOTAL_ADMINS: '管理员总数',
	ACTIVE_ADMINS: '活跃管理员',
	SUPER_ADMINS: '超级管理员',
	LIMITED_ADMINS: '有限管理员',
	
	// Admin Form
	ADMIN_FORM_CREATE_TITLE: '创建新管理员',
	ADMIN_FORM_EDIT_TITLE: '编辑管理员',
	ADMIN_FORM_BASIC_INFO: '基本信息',
	ADMIN_FORM_EDITING_INFO: '编辑：{{username}} ({{email}})',
	USERNAME_LABEL: '用户名',
	USERNAME_PLACEHOLDER: '请输入用户名',
	EMAIL_LABEL: '邮箱地址',
	EMAIL_PLACEHOLDER: '请输入邮箱地址',
	PASSWORD_LABEL: '密码',
	PASSWORD_PLACEHOLDER: '请输入密码',
	PASSWORD_EDIT_HINT: '（留空则保持当前密码）',
	CONFIRM_PASSWORD_LABEL: '确认密码',
	CONFIRM_PASSWORD_PLACEHOLDER: '请确认密码',
	FIRST_NAME_LABEL: '名',
	FIRST_NAME_PLACEHOLDER: '请输入名',
	LAST_NAME_LABEL: '姓',
	LAST_NAME_PLACEHOLDER: '请输入姓',
	ADMIN_TYPE_LABEL: '管理员类型',
	ADMIN_TYPE_HELP: '选择管理访问级别',
	SUPER_ADMIN_DESCRIPTION: '拥有所有权限的完整系统访问',
	LIMITED_ADMIN_DESCRIPTION: '受限访问，权限有限',
	IS_ACTIVE_LABEL: '激活状态',
	IS_ACTIVE_HELP: '此管理员账户当前是否处于活跃状态',
	
	// Form validation
	USERNAME_REQUIRED: '用户名是必填项',
	USERNAME_MIN_LENGTH: '用户名至少需要3个字符',
	USERNAME_MAX_LENGTH: '用户名必须少于50个字符',
	USERNAME_INVALID_CHARS: '用户名只能包含字母、数字和下划线',
	EMAIL_REQUIRED: '邮箱是必填项',
	EMAIL_INVALID: '请输入有效的邮箱地址',
	PASSWORD_REQUIRED: '密码是必填项',
	PASSWORD_MIN_LENGTH: '密码至少需要6个字符',
	FIRST_NAME_MAX_LENGTH: '名必须少于100个字符',
	LAST_NAME_MAX_LENGTH: '姓必须少于100个字符',
	ADMIN_TYPE_INVALID: '无效的管理员类型',
	PASSWORDS_MUST_MATCH: '密码必须匹配',
	ADMIN_TYPE_REQUIRED: '管理员类型是必填项',
	
	// Form actions
	CREATE_ADMIN_BUTTON: '创建管理员',
	UPDATE_ADMIN_BUTTON: '更新管理员',
	CANCEL_BUTTON: '取消',
	SAVE_BUTTON: '保存',
	
	// Accessibility labels
	TOGGLE_PASSWORD_VISIBILITY: '切换密码可见性',
	
	// Success messages
	ADMIN_CREATED_SUCCESS: '管理员创建成功',
	ADMIN_UPDATED_SUCCESS: '管理员更新成功',
	ADMIN_DELETED_SUCCESS: '管理员删除成功',
	
	// Error messages
	ADMIN_CREATE_ERROR: '创建管理员失败',
	ADMIN_UPDATE_ERROR: '更新管理员失败',
	ADMIN_DELETE_ERROR: '删除管理员失败',
	ADMIN_LOAD_ERROR: '加载管理员失败',
	
	// Delete confirmation
	DELETE_ADMIN_TITLE: '删除管理员',
	DELETE_ADMIN_MESSAGE: '您确定要删除此管理员吗？此操作无法撤销。',
	DELETE_ADMIN_WARNING: '此操作无法撤销，将永久删除管理员账户。',
	DELETE_ADMIN_CONFIRM: '删除',
	DELETE_ADMIN_CANCEL: '取消',
	
	// Operation Logs
	OPERATION_LOGS: '操作日志',
	ADMIN_LOGS_TITLE: '管理员日志',
	SYSTEM_LOGS_TITLE: '系统操作日志',
	OPERATION_LOGS_SUBTITLE: '查看全面的操作日志和审计跟踪',
	SEARCH_LOGS_PLACEHOLDER: '搜索日志...',
	
	// Log columns
	LOG_ID: '日志ID',
	ACTION: '操作',
	RESOURCE: '资源',
	RESOURCE_ID: '资源ID',
	TIMESTAMP: '时间戳',
	DURATION: '持续时间',
	SUCCESS: '成功',
	IP_ADDRESS: 'IP地址',
	USER_AGENT: '用户代理',
	DESCRIPTION: '描述',
	
	// Log filters
	FILTER_BY_ACTION: '按操作筛选',
	FILTER_BY_SUCCESS: '按状态筛选',
	FILTER_BY_RESOURCE: '按资源筛选',
	ALL_ACTIONS: '所有操作',
	ALL_RESOURCES: '所有资源',
	SUCCESSFUL_ONLY: '仅成功',
	FAILED_ONLY: '仅失败',
	DATE_RANGE: '日期范围',
	START_DATE: '开始日期',
	END_DATE: '结束日期',
	
	// Log actions
	LOGIN: '登录',
	LOGOUT: '登出',
	CREATE_USER: '创建用户',
	UPDATE_USER: '更新用户',
	DELETE_USER: '删除用户',
	CHANGE_PASSWORD: '修改密码',
	
	// Log status
	SUCCEEDED: '成功',
	FAILED: '失败',
	
	// Log details
	LOG_DETAILS: '日志详情',
	OPERATION_DETAILS: '操作详情',
	EXPAND_DETAILS: '展开详情',
	COLLAPSE_DETAILS: '收起详情',
	METADATA: '元数据',
	REQUEST_BODY: '请求体',
	RESPONSE_SIZE: '响应大小',
	ERROR_MESSAGE: '错误信息',
	ERROR_CODE: '错误代码',
	CHANGES: '变更',
	
	// Common values
	NOT_AVAILABLE: '不可用',
	UNKNOWN: '未知',
	
	// Time formatting
	MILLISECONDS: '毫秒',
	SECONDS: '秒',
	MINUTES_AGO: '分钟前',
	HOURS_AGO: '小时前',
	DAYS_AGO: '天前',
	JUST_NOW: '刚刚',
	
	// Data states
	NO_DATA: '暂无数据',
	NO_ADMINS_FOUND: '未找到管理员',
	NO_LOGS_FOUND: '未找到操作日志',
	LOADING_ADMINS: '正在加载管理员...',
	LOADING_LOGS: '正在加载操作日志...',
	
	// Pagination
	ROWS_PER_PAGE: '每页行数',
	PAGE_OF: '共',
	FIRST_PAGE: '首页',
	PREVIOUS_PAGE: '上一页',
	NEXT_PAGE: '下一页',
	LAST_PAGE: '末页',
	
	// Permissions
	INSUFFICIENT_PERMISSIONS: '权限不足',
	SUPER_ADMIN_REQUIRED: '需要超级管理员权限',
	PERMISSION_DENIED: '权限被拒绝',
	
	// Security warnings
	SECURITY_WARNING: '安全警告',
	SUPER_ADMIN_WARNING: '创建超级管理员将授予完整的系统访问权限。请确保这是您的意图。',
	PASSWORD_SECURITY: '请使用包含至少8个字符的强密码，包括大写字母、小写字母、数字和符号。',
	
	// General
	LOADING: '加载中...',
	ERROR: '错误',
	SUCCESS_STATUS: '成功',
	WARNING: '警告',
	INFO: '信息',
	NEVER: '从未',
	YES: '是',
	NO: '否',
	
	// Open System Logs
	OPEN_SYSTEM_LOGS_VIEWER: '打开系统日志查看器',
	SYSTEM_LOGS_DESCRIPTION: '查看全面的系统级操作日志和审计跟踪。',
	
	// Admin management info
	ADMIN_MANAGEMENT_INFO: '需要超级管理员权限',
	ADMIN_MANAGEMENT_INFO_DESCRIPTION: '此页面提供全面的管理员管理功能，包括账户创建、修改和操作日志监控。某些功能可能会根据您的管理员类型和权限受到限制。'
};

export default adminManagement; 