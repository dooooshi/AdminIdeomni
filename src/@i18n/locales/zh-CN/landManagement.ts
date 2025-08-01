const landManagement = {
  // General Terms
  LAND_MANAGEMENT: '土地管理',
  LAND: '土地',
  TILE: '地块',
  TILES: '地块',
  AREA: '面积',
  OWNERSHIP: '所有权',
  PURCHASE: '购买',
  PURCHASES: '购买记录',
  COST: '成本',
  PRICE: '价格',
  AVAILABLE: '可用',
  OWNED: '拥有',
  TEAM: '团队',
  TEAMS: '团队',
  
  // Land Types  
  PLAIN: '平原',
  COASTAL: '海岸',
  MARINE: '海洋',
  LAND_TYPE: '土地类型',
  
  // Purchase Status
  ACTIVE: '活跃',
  CANCELLED: '已取消',
  EXPIRED: '已过期', 
  STATUS: '状态',
  
  // Currency
  GOLD: '黄金',
  CARBON: '碳排放指数',
  GOLD_COST: '黄金成本',
  CARBON_COST: '碳排放指数成本',
  TOTAL_COST: '总成本',
  BALANCE: '余额',
  SPENT: '已花费',
  
  // Manager Pages
  MANAGER_MAP_VIEW: '管理员地图视图',
  MANAGER_OVERVIEW: '管理员概览',
  MANAGER_ANALYTICS: '管理员分析',
  ACTIVITY_LAND_OVERVIEW: '活动土地概览',
  LAND_ANALYTICS_DASHBOARD: '土地分析仪表板',
  
  // Student Pages  
  STUDENT_MAP_VIEW: '土地地图',
  STUDENT_PORTFOLIO: '土地投资组合',
  TEAM_LAND_PORTFOLIO: '团队土地投资组合',
  TEAM_LAND_MANAGEMENT: '团队土地管理',
  STUDENT_MAP_DESCRIPTION: '发现优质土地机会，进行战略投资。点击地块探索详情、比较价格并获得您的土地。',
  
  // Map Interface
  MAP_VIEW: '地图视图',
  INTERACTIVE_MAP: '交互式地图',
  MAP_LEGEND: '地图图例',
  ZOOM_IN: '放大',
  ZOOM_OUT: '缩小',
  RESET_ZOOM: '重置缩放',
  REFRESH_DATA: '刷新数据',
  ENABLE_ANIMATIONS: '启用土地动画',
  DISABLE_ANIMATIONS: '禁用土地动画',
  
  // Purchase Interface
  PURCHASE_LAND: '购买土地',
  PURCHASE_DIALOG_TITLE: '购买土地 - 地块 {tileId}',
  TILE_INFORMATION: '地块信息',
  YOUR_HOLDINGS: '您的持有',
  AREA_TO_PURCHASE: '待购买面积',
  PURCHASE_AMOUNT: '购买数量',
  AMOUNT_UNITS: '数量（单位）',
  AMOUNT_HELPER_TEXT: '请输入1到1,000单位之间的数量',
  PURCHASE_SUMMARY: '购买摘要',
  INVESTMENT_ANALYSIS: '投资分析',
  PRICE_PROTECTION: '价格保护',
  ENABLE_PRICE_PROTECTION: '启用价格保护',
  MAX_GOLD_COST: '最大黄金成本',
  MAX_CARBON_COST: '最大碳排放指数成本',
  PURCHASE_DESCRIPTION: '购买描述（可选）',
  NOTES_OPTIONAL: '备注（可选）',
  NOTES_PLACEHOLDER: '添加关于此次购买的备注...',
  CONFIRM_PURCHASE: '确认购买',
  PURCHASING: '购买中...',
  PURCHASE_UNITS: '购买 {amount} 单位',
  PURCHASE_COMPLETE: '购买完成',
  PURCHASE_FAILED: '购买失败',
  CAN_PURCHASE: '可购买',
  CANNOT_PURCHASE: '不可购买',
  PURCHASE_AVAILABLE: '可购买',
  
  // Ownership Details
  OWNED_AREA: '拥有面积',
  TOTAL_OWNED_AREA: '总拥有面积',
  AVAILABLE_AREA: '可用面积',
  TEAM_OWNED_AREA: '团队拥有面积',
  OWNERSHIP_PERCENTAGE: '拥有百分比',
  OWNERSHIP_BREAKDOWN: '拥有分解',
  
  // Financial Information
  TOTAL_INVESTMENT: '总投资',
  TOTAL_SPENT: '总花费',
  TOTAL_GOLD_SPENT: '总黄金花费',
  TOTAL_CARBON_SPENT: '总碳排放指数花费',
  AVERAGE_COST_PER_AREA: '每面积平均成本',
  INVESTMENT_BREAKDOWN: '投资分解',
  REVENUE: '收入',
  TOTAL_REVENUE: '总收入',
  
  // History and Timeline
  PURCHASE_HISTORY: '购买历史',
  PURCHASE_DATE: '购买日期',
  FIRST_PURCHASE: '首次购买',
  LATEST_PURCHASE: '最新购买',
  LAST_PURCHASE_DATE: '最后购买日期',
  ACTIVITY_TIMELINE: '活动时间线',
  ACTIVITY_PERIOD: '活动期间',
  ACTIVE_DAYS: '活跃天数',
  DAYS_SINCE_FIRST: '距首次购买天数',
  
  // Statistics and Analytics
  TOTAL_PURCHASES: '总购买数',
  TOTAL_TILES: '总地块数',
  TILES_OWNED: '拥有地块数',
  TILES_WITH_OWNERSHIP: '有拥有权的地块',
  TEAMS_WITH_LAND: '拥有土地的团队',
  AVERAGE_AREA_PER_TEAM: '每团队平均面积',
  MOST_ACTIVE_TILE: '最活跃地块',
  TOP_TEAM_BY_AREA: '按面积排名第一的团队',
  LEADING_TEAM: '领先团队',
  TOP_PERFORMER: '最佳表现者',
  
  // Performance Indicators
  PERFORMANCE_LEVEL: '表现水平',
  HIGH_IMPACT: '高影响',
  MODERATE_IMPACT: '中等影响',
  LOW_IMPACT: '低影响',
  EXCELLENT: '优秀',
  GOOD: '良好',
  AVERAGE: '平均',
  
  // Charts and Analytics
  PURCHASE_TRENDS: '购买趋势',
  PURCHASE_TRENDS_OVER_TIME: '随时间的购买趋势',
  LAND_TYPE_DISTRIBUTION: '土地类型分布',
  REVENUE_BY_LAND_TYPE: '按土地类型的收入',
  TOP_PERFORMING_TILES: '表现最佳的地块',
  TEAM_RANKINGS: '团队排名',
  TEAM_PERFORMANCE_RANKINGS: '团队表现排名',
  
  // Filters and Controls
  FILTERS: '筛选器',
  SHOW_FILTERS: '显示筛选器',
  HIDE_FILTERS: '隐藏筛选器',
  APPLY_FILTERS: '应用筛选器',
  CLEAR_FILTERS: '清除筛选器',
  SHOW_ONLY_AVAILABLE: '仅显示可用',
  SHOW_ONLY_OWNED: '仅显示拥有',
  MIN_PRICE: '最低价格',
  MAX_PRICE: '最高价格',
  MIN_AVAILABLE_AREA: '最小可用面积',
  TIME_RANGE: '时间范围',
  THIS_WEEK: '本周',
  THIS_MONTH: '本月',
  ALL_TIME: '所有时间',
  START_DATE: '开始日期',
  END_DATE: '结束日期',
  
  // Actions
  VIEW_DETAILS: '查看详情',
  VIEW_TEAM: '查看团队',
  EXPORT_DATA: '导出数据',
  RETRY: '重试',
  CANCEL: '取消',
  CLOSE: '关闭',
  
  // Messages and Status
  LOADING: '加载中...',
  NO_DATA_AVAILABLE: '无可用数据',
  NO_TEAM_DATA: '无团队投资组合数据。加入团队开始购买土地。',
  NO_PURCHASES_FOUND: '未找到购买历史',
  NO_ANALYTICS_DATA: '此活动无可用分析数据。',
  NO_RECENT_PURCHASES: '无最近购买记录显示',
  CALCULATING_COSTS: '计算成本中...',
  
  // Error Messages
  FAILED_TO_LOAD: '加载数据失败',
  PURCHASE_VALIDATION_FAILED: '购买验证失败',
  INSUFFICIENT_RESOURCES: '团队资源不足以购买',
  TILE_NOT_FOUND: '在当前活动中未找到地块',
  PRICE_PROTECTION_EXCEEDED: '购买成本超过最大价格限制',
  INVALID_AREA_AMOUNT: '购买面积数量无效',
  
  // Success Messages
  LAND_PURCHASED_SUCCESSFULLY: '土地购买成功！',
  DATA_REFRESHED: '数据刷新成功',
  FILTERS_APPLIED: '筛选器应用成功',
  
  // Validation Messages
  AREA_MUST_BE_POSITIVE: '面积必须大于0',
  AREA_CANNOT_EXCEED_MAX: '面积不能超过 {max} 单位',
  AREA_DECIMAL_PLACES: '面积最多只能有3位小数',
  MAX_COST_CANNOT_BE_NEGATIVE: '最大成本不能为负数',
  
  // Tooltips and Help Text
  AREA_TOOLTIP: '要购买的土地面积数量（0.001到100单位）',
  PRICE_PROTECTION_TOOLTIP: '设置最大成本以防止价格突然上涨',
  OWNERSHIP_PERCENTAGE_TOOLTIP: '此团队拥有的地块总面积百分比',
  UTILIZATION_RATE_TOOLTIP: '已购买的总可用土地百分比',
  
  // Table Headers
  DATE: '日期',
  TILE_ID: '地块编号',
  DESCRIPTION: '描述',
  RANK: '排名',
  TEAM_NAME: '团队名称',
  TOTAL_AREA: '总面积',
  PURCHASE_COUNT: '购买次数',
  AVG_COST_AREA: '平均面积成本',
  PERFORMANCE: '表现',
  
  // Units and Formatting
  AREA_UNIT: '平方单位',
  AREA_UNITS: '单位',
  CURRENCY_UNIT: '',
  PERCENTAGE_UNIT: '%',
  DAYS_UNIT: '天',
  PURCHASES_UNIT: '次购买',
  
  // Context Menu Actions
  QUICK_PURCHASE: '快速购买',
  PURCHASE_MAX_AVAILABLE: '购买最大可用量',
  VIEW_DETAILS: '查看详情',
  CALCULATE_COST: '计算成本',
  VIEW_TILE_INFORMATION: '查看地块信息和所有权',
  ESTIMATE_PURCHASE_COST: '估算不同面积的购买成本',
  PURCHASE_UNAVAILABLE: '无法购买',
  ALREADY_OWNED_BY_TEAM: '此地块已由您的团队拥有',
  NOT_AVAILABLE_FOR_PURCHASE: '此地块不可购买',
  BUY: '购买',
};

export default landManagement;