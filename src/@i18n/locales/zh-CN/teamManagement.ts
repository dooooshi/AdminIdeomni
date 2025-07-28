const teamManagement = {
  // Navigation & Headers
  TEAM_MANAGEMENT: '团队管理',
  TEAM_DASHBOARD: '团队仪表盘',
  BROWSE_TEAMS: '浏览团队',
  CREATE_TEAM: '创建团队',
  TEAM_SETTINGS: '团队设置',
  
  // Team Card Component
  OPEN: '开放',
  CLOSED: '关闭',
  FULL: '已满',
  MEMBERS: '成员',
  TEAM_LEADER: '团队负责人',
  CREATED: '创建于',
  VIEW_DETAILS: '查看详情',
  JOIN: '加入',
  JOINING: '加入中...',
  ACTIONS: '操作',
  AVAILABLE_SPOT: '可用位置',
  
  // Create Team Form
  CREATE_NEW_TEAM: '创建新团队',
  CREATE_TEAM_SUBTITLE: '建立一个新团队并开始与他人协作',
  BACK: '返回',
  TEAM_NAME: '团队名称',
  TEAM_NAME_PLACEHOLDER: '输入团队名称',
  DESCRIPTION_OPTIONAL: '描述（可选）',
  DESCRIPTION_PLACEHOLDER: '描述您团队的目标和宗旨',
  DESCRIPTION_CHAR_COUNT: '字符',
  MAXIMUM_MEMBERS: '最多成员数',
  TEAM_WILL_ALLOW: '团队最多允许',
  OPEN_TEAM: '开放团队',
  OPEN_TEAM_DESCRIPTION: '允许其他人发现并加入您的团队',
  CREATING_TEAM: '创建团队中...',
  
  // Team Creation Guidelines
  TEAM_CREATION_GUIDELINES: '团队创建指南',
  GUIDELINE_ONE_TEAM: '• 每个活动只能创建一个团队',
  GUIDELINE_AUTO_LEADER: '• 您将自动成为团队负责人',
  GUIDELINE_UNIQUE_NAME: '• 团队名称在活动内必须唯一',
  GUIDELINE_CHANGE_SETTINGS: '• 需要时可以稍后更改团队设置',
  
  // Browse Teams
  DISCOVER_JOIN_TEAMS: '发现并加入您活动中的团队',
  SEARCH_TEAMS_PLACEHOLDER: '按团队名称或描述搜索...',
  SEARCH: '搜索',
  FOUND_TEAMS: '找到',
  TEAMS: '个团队',
  FAILED_TO_LOAD_TEAMS: '加载团队失败',
  FAILED_TO_LOAD_TEAMS_MESSAGE: '加载可用团队时出错，请重试。',
  NO_TEAMS_FOUND: '未找到团队',
  NO_TEAMS_ADJUST_SEARCH: '尝试调整搜索条件',
  NO_TEAMS_AVAILABLE: '目前没有可用的团队',
  CREATE_NEW_TEAM_BUTTON: '创建新团队',
  CANT_FIND_RIGHT_TEAM: '找不到合适的团队？',
  CREATE_OWN_TEAM_MESSAGE: '创建您自己的团队并邀请其他人加入',
  
  // Team Member List
  TEAM_MEMBERS: '团队成员',
  LEADER: '负责人',
  JOINED: '加入于',
  MANAGER: '管理员',
  WORKER: '工作人员',
  STUDENT: '学生',
  
  // Form Validation Messages
  TEAM_NAME_REQUIRED: '团队名称为必填项',
  TEAM_NAME_MIN_LENGTH: '团队名称至少需要1个字符',
  TEAM_NAME_MAX_LENGTH: '团队名称最多50个字符',
  DESCRIPTION_MAX_LENGTH: '描述最多200个字符',
  MAX_MEMBERS_REQUIRED: '最大成员数为必填项',
  MIN_MEMBERS: '团队至少需要允许2名成员',
  MAX_MEMBERS_LIMIT: '团队不能超过20名成员',
  
  // Error Messages
  FAILED_TO_CREATE_TEAM: '创建团队失败，请重试。',
  FAILED_TO_JOIN_TEAM: '加入团队失败',
  
  // Success Messages
  TEAM_CREATED_SUCCESSFULLY: '团队创建成功',
  JOINED_TEAM_SUCCESSFULLY: '成功加入团队',
  
  // Status Labels
  ACTIVE: '活跃',
  INACTIVE: '非活跃',
  PENDING: '待定',
  
  // Team Dashboard
  MANAGE_TEAM_COLLABORATION: '管理您的团队协作和活动',
  NOT_IN_TEAM_YET: '您还不在任何团队中',
  JOIN_OR_CREATE_TEAM: '加入现有团队或创建新团队开始协作',
  BROWSE_TEAMS_BUTTON: '浏览团队',
  CREATE_TEAM_BUTTON: '创建团队',
  TEAM_INFORMATION: '团队信息',
  OPEN_TO_NEW_MEMBERS: '开放新成员加入',
  CLOSED_TEAM: '封闭团队',
  INVITE_MEMBERS: '邀请成员',
  QUICK_ACTIONS: '快速操作',
  BROWSE_OTHER_TEAMS: '浏览其他团队',
  SETTINGS: '设置',
  TEAM_DASHBOARD_FALLBACK: '团队仪表盘',
  
  // Resource Transfers
  RESOURCE_TRANSFERS: '资源转账',
  TRANSFER_HUB: '转账中心',
  TRANSFER_GOLD: '转账金币',
  TRANSFER_CARBON: '转账碳积分',
  SEND_RESOURCES: '发送资源',
  SEND_RESOURCES_SUBTITLE: '向活动中的其他团队转账金币和碳积分',
  TRANSFER_RESOURCES_TO_TEAMS: '向其他团队转账资源',
  SELECT_TRANSFER_TYPE: '选择您要转账的类型',
  GOLD_TRANSFERS: '金币转账',
  CARBON_TRANSFERS: '碳积分转账',
  RECENT_TRANSFERS: '最近转账',
  QUICK_TRANSFER: '快速转账',
  
  // Transfer Forms
  TRANSFER_GOLD_TO_TEAM: '向团队转账金币',
  TRANSFER_CARBON_TO_TEAM: '向团队转账碳积分',
  TRANSFER_GOLD_SUBTITLE: '从您的团队账户向另一个团队发送金币',
  TRANSFER_CARBON_SUBTITLE: '从您的团队账户向另一个团队发送碳积分',
  SELECT_TARGET_TEAM: '选择目标团队',
  SELECT_TEAM_PLACEHOLDER: '选择要转账的团队...',
  TRANSFER_AMOUNT: '转账金额',
  AMOUNT_PLACEHOLDER: '输入转账金额',
  AVAILABLE_BALANCE: '可用余额',
  TRANSFER_DESCRIPTION: '描述（可选）',
  TRANSFER_DESCRIPTION_PLACEHOLDER: '添加关于此转账的备注...',
  SEND_TRANSFER: '发送转账',
  SENDING_TRANSFER: '正在发送转账...',
  CANCEL_TRANSFER: '取消',
  CONFIRM_TRANSFER: '确认转账',
  TRANSFER_CONFIRMATION: '转账确认',
  REVIEW_TRANSFER_DETAILS: '请检查以下转账详情',
  TARGET_TEAM: '目标团队',
  AMOUNT: '金额',
  DESCRIPTION: '描述',
  CURRENT_BALANCE: '当前余额',
  BALANCE_AFTER_TRANSFER: '转账后余额',
  
  // Transfer Validation
  INVALID_AMOUNT: '请输入有效金额',
  AMOUNT_TOO_SMALL: '最小转账金额为 0.001',
  AMOUNT_TOO_LARGE: '金额超过可用余额',
  MAX_DECIMAL_PLACES: '最多允许 3 位小数',
  TARGET_TEAM_REQUIRED: '请选择目标团队',
  LARGE_TRANSFER_WARNING: '此转账超过您当前余额的 50%',
  INSUFFICIENT_BALANCE_ERROR: '此转账余额不足',
  SAME_TEAM_ERROR: '不能转账给同一个团队',
  
  // Transfer Success/Error Messages
  TRANSFER_SUCCESSFUL: '转账成功完成',
  TRANSFER_FAILED: '转账失败',
  GOLD_TRANSFER_SUCCESS: '金币转账成功完成',
  CARBON_TRANSFER_SUCCESS: '碳积分转账成功完成',
  TRANSFER_ERROR_GENERIC: '转账失败，请重试。',
  
  // Account History
  ACCOUNT_HISTORY: '账户历史',
  HISTORY_OVERVIEW: '历史概览',
  ALL_OPERATIONS: '所有操作',
  TRANSFER_HISTORY: '转账历史',
  BALANCE_HISTORY: '余额历史',
  VIEW_ACCOUNT_HISTORY: '查看账户历史',
  TRACK_ALL_OPERATIONS: '跟踪您团队的所有账户操作和转账',
  
  // Operation Types - Keep consistent with English for easier mapping
  ACCOUNT_CREATED: '账户创建',
  OUTGOING_TRANSFER: '转出',
  INCOMING_TRANSFER: '转入',
  MANAGER_ADJUSTMENT: '管理员调整',
  SYSTEM_GRANT: '系统授予',
  SYSTEM_DEDUCTION: '系统扣除',
  ACTIVITY_REWARD: '活动奖励',
  FACILITY_INCOME: '设施收入',
  FACILITY_EXPENSE: '设施支出'
};

export default teamManagement;