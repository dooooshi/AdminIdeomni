export const mtoTranslationsZh = {
  // Navigation
  'navigation.mtoManagement': 'MTO 管理',
  'MTO_TYPE1_TITLE': 'MTO 类型 1 - 基于人口',
  'MTO_TYPE2_TITLE': 'MTO 类型 2 - 基于商场',
  'MTO_STUDENT_DELIVERIES': 'MTO 交付',
  'MTO_STUDENT_MARKET': 'MTO 市场',
  'MTO_ORDERS': 'MTO 订单',
  'MTO_ORDERS_SUBTITLE': '查看并履行按订单制造需求',

  // Common
  'common.all': '全部',
  'common.search': '搜索',
  'common.actions': '操作',
  'common.view': '查看',
  'common.edit': '编辑',
  'common.delete': '删除',
  'common.cancel': '取消',
  'common.create': '创建',
  'common.update': '更新',
  'common.save': '保存',
  'common.rowsPerPage': '每页行数',
  'common.home': '首页',

  // MTO Type 1
  'mto.type1.title': 'MTO 类型 1 - 基于人口',
  'mto.type1.description': '基于人口的订制采购系统，具有自动需求分配功能',
  'mto.type1.populationBased': '基于人口',

  // Tabs
  'mto.type1.tabs.requirements': '需求管理',
  'mto.type1.tabs.analytics': '分析与报告',

  // List
  'mto.type1.searchPlaceholder': '搜索需求...',
  'mto.type1.createRequirement': '创建需求',
  'mto.type1.editRequirement': '编辑需求',
  'mto.type1.noRequirements': '未找到需求',

  // Table headers
  'mto.type1.id': '编号',
  'mto.type1.name': '名称',
  'mto.type1.formula': '产品配方',
  'mto.type1.unitPrice': '单价',
  'mto.type1.totalQuantity': '总数量',
  'mto.type1.totalBudget': '总预算',
  'mto.type1.releaseTime': '发布时间',
  'mto.type1.settlementTime': '结算时间',
  'mto.type1.status': '状态',

  // Actions
  'mto.type1.release': '发布',
  'mto.type1.cancel': '取消',
  'mto.type1.settle': '结算',

  // Statuses
  'mto.type1.statuses.draft': '草稿',
  'mto.type1.statuses.released': '已发布',
  'mto.type1.statuses.inProgress': '进行中',
  'mto.type1.statuses.settled': '已结算',
  'mto.type1.statuses.cancelled': '已取消',

  // Form sections
  'mto.type1.sections.basicInfo': '基本信息',
  'mto.type1.sections.pricing': '定价与数量',
  'mto.type1.sections.schedule': '时间安排',

  // Form fields
  'mto.type1.fields.name': '需求名称',
  'mto.type1.fields.description': '描述',
  'mto.type1.fields.productFormula': '产品配方',
  'mto.type1.fields.unitPrice': '单位采购价格（金币）',
  'mto.type1.fields.basePurchaseNumber': '基础采购数量',
  'mto.type1.fields.overallPurchaseNumber': '总采购数量',
  'mto.type1.fields.baseCountPopulation': '基础计算人口',
  'mto.type1.fields.totalBudget': '总预算',
  'mto.type1.fields.releaseTime': '发布时间',
  'mto.type1.fields.settlementTime': '结算时间',
  'mto.type1.fields.notes': '内部备注',

  // Form helpers
  'mto.type1.helpers.basePurchaseNumber': '每人口单位的基础数量',
  'mto.type1.helpers.baseCountPopulation': '用于计算的人口单位（默认：1000）',
  'mto.type1.helpers.totalBudget': '自动计算：单价 × 总数量',

  // Validation messages
  'mto.type1.validation.nameRequired': '名称不能为空',
  'mto.type1.validation.formulaRequired': '产品配方不能为空',
  'mto.type1.validation.invalidPrice': '价格必须大于 0',
  'mto.type1.validation.invalidQuantity': '数量必须大于 0',
  'mto.type1.validation.invalidPopulation': '人口必须大于 0',
  'mto.type1.validation.releaseTimeRequired': '发布时间不能为空',
  'mto.type1.validation.settlementTimeRequired': '结算时间不能为空',
  'mto.type1.validation.settlementAfterRelease': '结算时间必须晚于发布时间',
  'mto.type1.validation.futureReleaseTime': '发布时间必须是未来时间',

  // Success messages
  'mto.type1.messages.created': '需求创建成功',
  'mto.type1.messages.updated': '需求更新成功',
  'mto.type1.messages.deleted': '需求删除成功',
  'mto.type1.messages.released': '需求发布成功',
  'mto.type1.messages.cancelled': '需求取消成功',
  'mto.type1.messages.settled': '需求结算成功',

  // Error messages
  'mto.type1.errors.loadFailed': '加载需求失败',
  'mto.type1.errors.formulasLoadFailed': '加载产品配方失败',
  'mto.type1.errors.saveFailed': '保存需求失败',
  'mto.type1.errors.deleteFailed': '删除需求失败',
  'mto.type1.errors.releaseFailed': '发布需求失败',
  'mto.type1.errors.cancelFailed': '取消需求失败',
  'mto.type1.errors.settleFailed': '结算需求失败',

  // Warnings
  'mto.type1.warnings.cannotEditReleased': '该需求已发布，无法编辑',

  // Delete confirmation
  'mto.type1.deleteConfirmTitle': '删除需求',
  'mto.type1.deleteConfirmMessage': '确定要删除需求 #{id} "{name}" 吗？此操作无法撤销。',

  // Analytics
  'mto.type1.analytics.title': '分析与报告',
  'mto.type1.analytics.comingSoon': '分析和报告功能即将推出',

  // MTO Type 2
  'mto.type2.title': 'MTO 类型 2 - 基于商场',
  'mto.type2.description': '商场独享的竞价采购系统',
  'mto.type2.mallBased': '基于商场',
  'mto.type2.competitiveBidding': '竞价投标',

  // Coming soon
  'mto.type2.comingSoon.title': 'MTO 类型 2 即将推出',
  'mto.type2.comingSoon.description': '基于商场的竞价投标系统正在开发中',
  'mto.type2.comingSoon.features': '功能将包括：商场独享参与、竞争定价机制、动态预算分配和自动结算处理',

  // Tabs
  'mto.type2.tabs.requirements': '需求管理',
  'mto.type2.tabs.submissions': '提交管理',
  'mto.type2.tabs.analytics': '分析与报告',

  // Statuses (Type 2)
  'mto.type2.statuses.draft': '草稿',
  'mto.type2.statuses.released': '已发布',
  'mto.type2.statuses.inProgress': '进行中',
  'mto.type2.statuses.settled': '已结算',
  'mto.type2.statuses.cancelled': '已取消',

  // Student/Team views
  'mto.student.availableRequirements': '可用需求',
  'mto.student.myDeliveries': '我的交付',
  'mto.student.mySubmissions': '我的提交',
  'mto.student.makeDelivery': '进行交付',
  'mto.student.submitProduct': '提交产品',
  'mto.student.viewDetails': '查看详情',
  'mto.student.transportationCost': '运输成本',
  'mto.student.expectedRevenue': '预期收入',
  'mto.student.netProfit': '净利润',

  // MALL owner specific
  'mto.mall.myMalls': '我的商场',
  'mto.mall.competitorAnalysis': '竞争对手分析',
  'mto.mall.priceStrategy': '价格策略',
  'mto.mall.submitToMall': '提交至商场',
  'mto.mall.level': '等级',
  'mto.mall.estimatedBudget': '预估预算份额',
  'mto.mall.competition': '竞争程度',
  'mto.mall.competitionLow': '低',
  'mto.mall.competitionMedium': '中',
  'mto.mall.competitionHigh': '高'
};