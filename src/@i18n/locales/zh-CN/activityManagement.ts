const activityManagement = {
  // Page titles and headers
  ACTIVITY_MANAGEMENT: '活动管理',
  ACTIVITY_MANAGEMENT_SUBTITLE: '管理商业模拟活动并监控参与情况。',
  ACTIVITY_LIST: '活动列表',
  ACTIVITY_STATISTICS: '统计信息',
  UPCOMING_ACTIVITIES: '即将开始的活动',
  ONGOING_ACTIVITIES: '进行中的活动',
  
  // Common actions
  CREATE_ACTIVITY: '创建活动',
  EDIT_ACTIVITY: '编辑活动',
  DELETE_ACTIVITY: '删除活动',
  RESTORE_ACTIVITY: '恢复活动',
  VIEW_ACTIVITY: '查看活动',
  DUPLICATE_ACTIVITY: '复制活动',
  REFRESH_DATA: '刷新数据',
  
  // Activity List Table Headers
  ACTIVITY_NAME: '活动名称',
  ACTIVITY_TYPE: '类型',
  START_DATE: '开始日期',
  END_DATE: '结束日期',
  DURATION: '持续时间',
  STATUS: '状态',
  CREATED_BY: '创建者',
  CREATED_AT: '创建时间',
  UPDATED_AT: '更新时间',
  ACTIONS: '操作',
  PARTICIPANTS: '参与者',
  
  // Activity Types
  BIZSIMULATION2_0: '商业模拟 2.0',
  BIZSIMULATION2_2: '商业模拟 2.2',
  BIZSIMULATION3_1: '商业模拟 3.1',
  ACTIVITY_TYPE_LABEL: '活动类型',
  
  // Activity Status
  UPCOMING: '即将开始',
  ONGOING: '进行中',
  COMPLETED: '已完成',
  ACTIVE: '活跃',
  INACTIVE: '非活跃',
  DELETED: '已删除',
  
  // Filters and Search
  SEARCH_ACTIVITIES: '搜索活动...',
  FILTER_BY_TYPE: '按类型筛选',
  FILTER_BY_STATUS: '按状态筛选',
  FILTER_BY_CREATOR: '按创建者筛选',
  FILTER_BY_DATE_RANGE: '按日期范围筛选',
  ALL_TYPES: '所有类型',
  ALL_STATUSES: '所有状态',
  ALL_CREATORS: '所有创建者',
  DATE_FROM: '开始日期',
  DATE_TO: '结束日期',
  INCLUDE_DELETED: '包含已删除',
  APPLY_FILTERS: '应用筛选',
  CLEAR_FILTERS: '清除筛选',
  
  // Statistics Cards
  TOTAL_ACTIVITIES: '活动总数',
  ACTIVE_ACTIVITIES: '活跃活动',
  UPCOMING_COUNT: '即将开始',
  ONGOING_COUNT: '进行中',
  COMPLETED_COUNT: '已完成',
  BY_TYPE_DISTRIBUTION: '按类型分布',
  
  // Activity Form
  ACTIVITY_FORM_CREATE_TITLE: '创建新活动',
  ACTIVITY_FORM_EDIT_TITLE: '编辑活动',
  ACTIVITY_BASIC_INFO: '基本信息',
  ACTIVITY_SCHEDULE: '时间安排',
  ACTIVITY_SETTINGS: '设置',
  
  // Form Fields
  ACTIVITY_NAME_LABEL: '活动名称',
  ACTIVITY_NAME_PLACEHOLDER: '请输入活动名称',
  ACTIVITY_TYPE_PLACEHOLDER: '请选择活动类型',
  DESCRIPTION_LABEL: '描述',
  DESCRIPTION_PLACEHOLDER: '请输入活动描述（可选）',
  START_DATE_LABEL: '开始日期和时间',
  END_DATE_LABEL: '结束日期和时间',
  IS_ACTIVE_LABEL: '活跃状态',
  IS_ACTIVE_HELPER: '非活跃的活动对参与者隐藏',
  
  // Map Template Fields
  MAP_TEMPLATE_CONFIGURATION: '地图模板配置',
  MAP_TEMPLATE_LABEL: '地图模板',
  MAP_TEMPLATE_PLACEHOLDER: '选择地图模板',
  MAP_TEMPLATE_EDIT_DISABLED: '编辑活动时无法更改地图模板',
  LOADING_TEMPLATES: '正在加载模板...',
  NO_MAP_TEMPLATES_FOUND: '没有可用的地图模板',
  NO_DESCRIPTION: '没有描述',
  
  // Form Validation Messages
  ACTIVITY_NAME_REQUIRED: '活动名称是必需的',
  ACTIVITY_NAME_MIN_LENGTH: '活动名称至少需要3个字符',
  ACTIVITY_NAME_MAX_LENGTH: '活动名称不能超过200个字符',
  ACTIVITY_TYPE_REQUIRED: '活动类型是必需的',
  ACTIVITY_TYPE_INVALID: '请选择有效的活动类型',
  START_DATE_REQUIRED: '开始日期和时间是必需的',
  END_DATE_REQUIRED: '结束日期和时间是必需的',
  END_DATE_AFTER_START: '结束日期必须在开始日期之后',
  DESCRIPTION_MAX_LENGTH: '描述不能超过1000个字符',
  FUTURE_START_DATE: '开始日期必须是未来时间',
  VALID_DATE_RANGE: '请选择有效的日期范围',
  MAP_TEMPLATE_REQUIRED: '地图模板是必需的',
  MAP_TEMPLATE_INVALID: '请选择有效的地图模板',
  
  // Form Actions
  UPDATE_ACTIVITY: '更新活动',
  SAVING: '保存中...',
  CANCEL: '取消',
  SAVE_DRAFT: '保存为草稿',
  
  // Delete Dialog
  DELETE_ACTIVITY_TITLE: '删除活动',
  DELETE_ACTIVITY_MESSAGE: '您确定要删除"{{activityName}}"吗？超级管理员可以撤销此操作。',
  DELETE_ACTIVITY_WARNING: '参与者将无法再访问此活动。',
  DELETE_CONFIRM: '删除',
  DELETE_CANCEL: '取消',
  
  // Restore Dialog
  RESTORE_ACTIVITY_TITLE: '恢复活动',
  RESTORE_ACTIVITY_MESSAGE: '您确定要恢复"{{activityName}}"吗？',
  RESTORE_CONFIRM: '恢复',
  RESTORE_CANCEL: '取消',
  
  // Success Messages
  ACTIVITY_CREATED_SUCCESS: '活动"{{activityName}}"已成功创建。',
  ACTIVITY_UPDATED_SUCCESS: '活动"{{activityName}}"已成功更新。',
  ACTIVITY_DELETED_SUCCESS: '活动"{{activityName}}"已成功删除。',
  ACTIVITY_RESTORED_SUCCESS: '活动"{{activityName}}"已成功恢复。',
  
  // Error Messages
  ACTIVITY_LOAD_ERROR: '加载活动失败。请重试。',
  ACTIVITY_CREATE_ERROR: '创建活动失败。请重试。',
  ACTIVITY_UPDATE_ERROR: '更新活动失败。请重试。',
  ACTIVITY_DELETE_ERROR: '删除活动失败。请重试。',
  ACTIVITY_RESTORE_ERROR: '恢复活动失败。请重试。',
  ACTIVITY_NOT_FOUND: '找不到活动。',
  STATISTICS_LOAD_ERROR: '加载活动统计信息失败。',
  NETWORK_ERROR: '网络错误。请检查您的连接并重试。',
  PERMISSION_DENIED: '您没有执行此操作的权限。',
  
  // Loading States
  LOADING_ACTIVITIES: '正在加载活动...',
  LOADING_STATISTICS: '正在加载统计信息...',
  CREATING_ACTIVITY: '正在创建活动...',
  UPDATING_ACTIVITY: '正在更新活动...',
  DELETING_ACTIVITY: '正在删除活动...',
  RESTORING_ACTIVITY: '正在恢复活动...',
  
  // Empty States
  NO_ACTIVITIES_FOUND: '未找到活动',
  NO_ACTIVITIES_MESSAGE: '没有符合您条件的活动。请尝试调整筛选条件或创建新活动。',
  NO_UPCOMING_ACTIVITIES: '没有即将开始的活动',
  NO_ONGOING_ACTIVITIES: '没有进行中的活动',
  CREATE_FIRST_ACTIVITY: '创建您的第一个活动以开始使用。',
  
  // Pagination
  ACTIVITIES_PER_PAGE: '每页活动数',
  SHOWING_ACTIVITIES: '显示第{{start}}-{{end}}项，共{{total}}项活动',
  PAGE_INFO: '第{{page}}页，共{{totalPages}}页',
  
  // Date and Time Formatting
  TODAY: '今天',
  YESTERDAY: '昨天',
  TOMORROW: '明天',
  DAYS_AGO: '{{days}}天前',
  DAYS_FROM_NOW: '{{days}}天后',
  HOURS_AGO: '{{hours}}小时前',
  HOURS_FROM_NOW: '{{hours}}小时后',
  MINUTES_AGO: '{{minutes}}分钟前',
  MINUTES_FROM_NOW: '{{minutes}}分钟后',
  
  // Duration Formatting
  DURATION_DAYS: '{{days}}天',
  DURATION_HOURS: '{{hours}}小时',
  DURATION_MINUTES: '{{minutes}}分钟',
  DURATION_MULTI: '{{days}}天{{hours}}小时{{minutes}}分钟',
  
  // Tooltips and Help Text
  ACTIVITY_TYPE_TOOLTIP: '商业模拟活动的类型',
  START_DATE_TOOLTIP: '参与者可以开始访问活动的时间',
  END_DATE_TOOLTIP: '活动自动关闭的时间',
  ACTIVE_STATUS_TOOLTIP: '参与者是否可以看到和访问此活动',
  DELETE_TOOLTIP: '软删除此活动（可以恢复）',
  RESTORE_TOOLTIP: '恢复此已删除的活动',
  EDIT_TOOLTIP: '编辑活动详情',
  VIEW_TOOLTIP: '查看活动详情',
  
  // Accessibility Labels
  ACTIVITY_TABLE_CAPTION: '商业模拟活动列表',
  SEARCH_INPUT_LABEL: '按名称搜索活动',
  TYPE_FILTER_LABEL: '按类型筛选活动',
  STATUS_FILTER_LABEL: '按状态筛选活动',
  SORT_BY_NAME: '按活动名称排序',
  SORT_BY_DATE: '按日期排序',
  SORT_BY_TYPE: '按活动类型排序',
  
  // Export and Import
  EXPORT_ACTIVITIES: '导出活动',
  IMPORT_ACTIVITIES: '导入活动',
  EXPORT_TOOLTIP: '将活动导出为CSV或Excel文件',
  IMPORT_TOOLTIP: '从CSV或Excel文件导入活动',
  
  // Bulk Actions
  SELECT_ALL: '全选',
  DESELECT_ALL: '取消全选',
  BULK_DELETE: '删除所选',
  BULK_ACTIVATE: '激活所选',
  BULK_DEACTIVATE: '停用所选',
  SELECTED_COUNT: '已选择{{count}}项',
  
  // Advanced Features
  DUPLICATE_ACTIVITY_TITLE: '复制活动',
  DUPLICATE_ACTIVITY_MESSAGE: '创建"{{activityName}}"的副本并设置新时间安排？',
  SCHEDULE_CONFLICTS: '时间安排冲突',
  OVERLAPPING_ACTIVITIES: '此活动与现有活动时间重叠',
  
  // Permissions
  SUPER_ADMIN_ONLY: '此操作仅限超级管理员使用',
  CREATOR_ONLY: '您只能修改自己创建的活动',
  READ_ONLY_ACCESS: '您对此活动只有只读访问权限',

  // User-Activity Relationship Management
  PARTICIPANTS_MANAGEMENT: '参与者管理',
  ACTIVITY_PARTICIPANTS: '活动参与者',
  PARTICIPANTS_LOAD_ERROR: '加载参与者失败',
  NO_PARTICIPANTS_FOUND: '未找到参与者',
  NO_PARTICIPANTS_MESSAGE: '此活动还没有参与者。',
  ADD_FIRST_PARTICIPANTS: '添加第一批参与者',
  
  // User Management Actions
  ADD_USERS: '添加用户',
  REMOVE_USERS: '移除用户',
  ADD_USERS_TO_ACTIVITY: '将用户添加到活动',
  REMOVE_USERS_FROM_ACTIVITY: '从活动中移除用户',
  REMOVE_SELECTED: '移除选中的',
  UPDATE_STATUS: '更新状态',
  BULK_UPDATE_STATUS: '批量更新状态',
  
  // User Status Management
  ENROLLED: '已报名',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  NO_SHOW: '未到场',
  UPDATE_PARTICIPANT_STATUS: '更新参与者状态',
  NEW_STATUS: '新状态',
  CURRENT_STATUS: '当前状态',
  STATUS_UPDATE_ERROR: '更新状态失败',
  BULK_STATUS_UPDATE_ERROR: '批量更新状态失败',
  
  // User Information
  USER: '用户',
  USER_TYPE: '用户类型',
  MANAGER: '管理者',
  WORKER: '员工',
  STUDENT: '学生',
  UNKNOWN: '未知',
  ENROLLED_AT: '报名时间',
  ADDED_BY: '添加者',
  SYSTEM: '系统',
  INACTIVE: '非活跃',
  
  // Search and Filters
  SEARCH_PARTICIPANTS: '搜索参与者',
  SEARCH_BY_NAME_EMAIL: '按姓名或邮箱搜索',
  ALL_TYPES: '所有类型',
  ALL_STATUSES: '所有状态',
  INCLUDE_INACTIVE_USERS: '包含非活跃用户',
  FILTERS: '筛选',
  
  // Statistics
  TOTAL_PARTICIPANTS: '参与者总数',
  
  // User Operations
  SEARCH_USERS: '搜索用户',
  SEARCH_USERS_BY_NAME_EMAIL: '按姓名或邮箱搜索用户',
  TYPE_TO_SEARCH: '输入以搜索...',
  SEARCHING_USERS: '正在搜索用户...',
  NO_USERS_FOUND: '未找到用户',
  START_TYPING_TO_SEARCH: '开始输入以搜索用户',
  SELECTED_USERS: '已选用户',
  USERS_TO_REMOVE: '要移除的用户',
  NO_USERS_SELECTED: '未选择用户',
  NO_USERS_SELECTED_ADD: '搜索并选择要添加到此活动的用户',
  NO_USERS_SELECTED_REMOVE: '从参与者列表中选择要移除的用户',
  FAILED_TO_LOAD_USERS: '加载用户失败',
  
  // Operation Details
  OPERATION_DETAILS: '操作详情',
  REASON: '原因',
  REASON_PLACEHOLDER: '输入此操作的原因（可选）',
  REASON_FOR_ADDING_USERS: '为什么要将这些用户添加到活动中？',
  REASON_FOR_REMOVING_USERS: '为什么要从活动中移除这些用户？',
  BULK_REASON_PLACEHOLDER: '输入批量状态更新的原因（可选）',
  SEND_EMAIL_NOTIFICATION: '发送邮件通知',
  
  // Operation Results
  OPERATION_RESULTS: '操作结果',
  OPERATION_COMPLETED_AT: '操作完成时间',
  TOTAL_PROCESSED: '总处理数',
  SUCCESSFUL: '成功',
  FAILED: '失败',
  DETAILED_RESULTS: '详细结果',
  OPERATION_SUCCESSFUL: '操作成功',
  OPERATION_FAILED: '操作失败',
  PROCESSING: '处理中...',
  CLOSE: '关闭',
  
  // User Activity History
  USER_ACTIVITY_HISTORY: '用户活动历史',
  LOADING_USER_INFO: '正在加载用户信息...',
  FAILED_TO_LOAD_USER: '加载用户信息失败',
  NO_ACTIVITY_HISTORY: '没有活动历史',
  NO_ACTIVITY_HISTORY_MESSAGE: '此用户没有活动参与历史。',
  LOADING_ACTIVITY_HISTORY: '正在加载活动历史...',
  HISTORY_LOAD_ERROR: '加载活动历史失败',
  
  // History Filters
  INCLUDE_UPCOMING: '包含即将开始',
  INCLUDE_PAST: '包含过去',
  CANCELLED_NO_SHOW: '已取消/未到场',
  
  // Time Status
  TIME_STATUS: '时间状态',
  COMPLETED_TIME: '已结束',
  DURATION: '持续时间',
  MINUTES: '分钟',
  HOURS: '小时',
  DAYS: '天',
  
  // Activity Selection
  NO_ACTIVITY_SELECTED: '未选择活动',
  SELECT_ACTIVITY_TO_MANAGE_PARTICIPANTS: '从列表中选择一个活动来管理其参与者',
  GO_TO_ACTIVITIES: '转到活动列表',
  
  // Actions
  VIEW_PARTICIPANTS: '查看参与者',
  VIEW_USER_HISTORY: '查看用户历史',
  SEND_EMAIL: '发送邮件',
  UPDATE_ALL: '全部更新',
  REFRESH: '刷新',
  
  // Participant Actions
  PARTICIPANTS: '参与者',
  UPDATE_ALL: '全部更新',
};

export default activityManagement; 