# i18n Design: Manager Team Status

## Overview

This document defines the internationalization (i18n) strategy for the Manager Team Status Dashboard, supporting both English (en) and Chinese (zh) languages.

## Language Support

### Supported Languages

| Language | Code | Default | Status |
|----------|------|---------|--------|
| Chinese (Simplified) | zh | ✅ | Primary |
| English | en | ❌ | Secondary |

### Language Detection Priority

1. Query parameter: `?lang=zh` or `?lang=en`
2. Custom header: `x-lang: zh` or `x-lang: en`
3. Accept-Language header: Standard HTTP header
4. User preference: Stored in user profile
5. Default: Chinese (zh)

## Translation Structure

### Translation Files Location

```
src/common/i18n/translations/
├── en/
│   └── manager/
│       └── team-status.json
└── zh/
    └── manager/
        └── team-status.json
```

### Translation Key Naming Convention

```typescript
// Pattern: module.feature.context.specific
"manager.teamStatus.title.dashboard"
"manager.teamStatus.table.header.teamName"
"manager.teamStatus.filter.label.status"
"manager.teamStatus.message.success.dataLoaded"
"manager.teamStatus.error.teamNotFound"
```

## Translation Content

### English Translations (`en/manager/team-status.json`)

```json
{
  "manager": {
    "teamStatus": {
      "title": {
        "dashboard": "Team Status Dashboard",
        "teamList": "All Teams",
        "teamDetails": "Team Details",
        "operations": "Operation History",
        "facilities": "Facilities",
        "landOwnership": "Land Ownership",
        "members": "Team Members"
      },

      "table": {
        "header": {
          "teamName": "Team Name",
          "leader": "Team Leader",
          "members": "Members",
          "goldBalance": "Gold Balance",
          "carbonBalance": "Carbon Balance",
          "status": "Status",
          "lastActivity": "Last Activity",
          "createdAt": "Created Date",
          "actions": "Actions"
        },
        "cell": {
          "memberCount": "{{current}}/{{max}} members",
          "openStatus": "Open",
          "closedStatus": "Closed",
          "viewDetails": "View Details"
        }
      },

      "filter": {
        "label": {
          "search": "Search teams...",
          "status": "Team Status",
          "sortBy": "Sort By",
          "order": "Order"
        },
        "option": {
          "allStatus": "All Status",
          "open": "Open Teams",
          "closed": "Closed Teams",
          "ascending": "Ascending",
          "descending": "Descending"
        }
      },

      "detail": {
        "section": {
          "overview": "Overview",
          "financial": "Financial Status",
          "statistics": "Statistics",
          "recentActivity": "Recent Activity"
        },
        "field": {
          "teamId": "Team ID",
          "description": "Description",
          "leader": "Team Leader",
          "createdAt": "Created",
          "updatedAt": "Last Updated",
          "goldBalance": "Gold Balance",
          "carbonBalance": "Carbon Balance",
          "totalMembers": "Total Members",
          "activeMembers": "Active Members",
          "totalLandOwned": "Total Land Owned",
          "totalFacilities": "Total Facilities",
          "activeFacilities": "Active Facilities"
        }
      },

      "operations": {
        "type": {
          "ACCOUNT_CREATED": "Account Created",
          "TRANSFER_OUT": "Transfer Out",
          "TRANSFER_IN": "Transfer In",
          "FACILITY_BUILD": "Facility Built",
          "FACILITY_UPGRADE": "Facility Upgraded",
          "LAND_PURCHASE": "Land Purchased",
          "RAW_MATERIAL_PRODUCTION": "Raw Material Produced",
          "PRODUCT_SALE": "Product Sold",
          "UTILITY_CONSUMPTION": "Utility Consumed",
          "TRADE_PURCHASE": "Trade Purchase"
        },
        "column": {
          "date": "Date",
          "type": "Operation Type",
          "resource": "Resource",
          "amount": "Amount",
          "balance": "Balance",
          "operator": "Operator",
          "description": "Description"
        }
      },

      "facilities": {
        "status": {
          "UNDER_CONSTRUCTION": "Under Construction",
          "ACTIVE": "Active",
          "MAINTENANCE": "Maintenance",
          "DAMAGED": "Damaged",
          "DECOMMISSIONED": "Decommissioned"
        },
        "category": {
          "RAW_MATERIAL_PRODUCTION": "Raw Material Production",
          "FUNCTIONAL": "Functional Facilities",
          "INFRASTRUCTURE": "Infrastructure",
          "POPULATION_GROWTH": "Population Growth"
        },
        "type": {
          "MINE": "Mine",
          "QUARRY": "Quarry",
          "FOREST": "Forest",
          "FARM": "Farm",
          "RANCH": "Ranch",
          "FISHERY": "Fishery",
          "FACTORY": "Factory",
          "MALL": "Mall",
          "WAREHOUSE": "Warehouse",
          "WATER_PLANT": "Water Plant",
          "POWER_PLANT": "Power Plant",
          "BASE_STATION": "Base Station",
          "FIRE_STATION": "Fire Station",
          "SCHOOL": "School",
          "HOSPITAL": "Hospital",
          "PARK": "Park",
          "CINEMA": "Cinema"
        }
      },

      "land": {
        "field": {
          "tileLocation": "Tile Location",
          "landType": "Land Type",
          "ownedArea": "Owned Area",
          "totalInvestment": "Total Investment",
          "purchaseCount": "Purchase Count",
          "firstPurchase": "First Purchase",
          "lastPurchase": "Last Purchase"
        }
      },

      "members": {
        "status": {
          "ACTIVE": "Active",
          "INACTIVE": "Inactive",
          "PENDING": "Pending"
        },
        "userType": {
          "1": "Manager",
          "2": "Worker",
          "3": "Student"
        },
        "column": {
          "username": "Username",
          "email": "Email",
          "fullName": "Full Name",
          "userType": "User Type",
          "status": "Status",
          "joinedAt": "Joined Date",
          "lastLogin": "Last Login"
        }
      },

      "pagination": {
        "showing": "Showing {{start}}-{{end}} of {{total}}",
        "rowsPerPage": "Rows per page:",
        "page": "Page {{current}} of {{total}}",
        "previous": "Previous",
        "next": "Next",
        "first": "First",
        "last": "Last"
      },

      "message": {
        "loading": "Loading team data...",
        "noData": "No teams found",
        "success": {
          "dataLoaded": "Team data loaded successfully",
          "exported": "Data exported successfully"
        },
        "error": {
          "loadFailed": "Failed to load team data",
          "teamNotFound": "Team not found",
          "unauthorized": "You are not authorized to view this data",
          "noActivity": "No active activity enrollment found"
        }
      },

      "action": {
        "refresh": "Refresh",
        "export": "Export",
        "viewDetails": "View Details",
        "back": "Back to List",
        "filter": "Filter",
        "clearFilter": "Clear Filters"
      }
    }
  }
}
```

### Chinese Translations (`zh/manager/team-status.json`)

```json
{
  "manager": {
    "teamStatus": {
      "title": {
        "dashboard": "团队状态仪表板",
        "teamList": "所有团队",
        "teamDetails": "团队详情",
        "operations": "操作历史",
        "facilities": "设施",
        "landOwnership": "土地所有权",
        "members": "团队成员"
      },

      "table": {
        "header": {
          "teamName": "团队名称",
          "leader": "团队负责人",
          "members": "成员",
          "goldBalance": "黄金余额",
          "carbonBalance": "碳积分余额",
          "status": "状态",
          "lastActivity": "最后活动",
          "createdAt": "创建日期",
          "actions": "操作"
        },
        "cell": {
          "memberCount": "{{current}}/{{max}} 成员",
          "openStatus": "开放",
          "closedStatus": "关闭",
          "viewDetails": "查看详情"
        }
      },

      "filter": {
        "label": {
          "search": "搜索团队...",
          "status": "团队状态",
          "sortBy": "排序方式",
          "order": "排序"
        },
        "option": {
          "allStatus": "全部状态",
          "open": "开放团队",
          "closed": "关闭团队",
          "ascending": "升序",
          "descending": "降序"
        }
      },

      "detail": {
        "section": {
          "overview": "概览",
          "financial": "财务状态",
          "statistics": "统计数据",
          "recentActivity": "最近活动"
        },
        "field": {
          "teamId": "团队ID",
          "description": "描述",
          "leader": "团队负责人",
          "createdAt": "创建时间",
          "updatedAt": "最后更新",
          "goldBalance": "黄金余额",
          "carbonBalance": "碳积分余额",
          "totalMembers": "总成员数",
          "activeMembers": "活跃成员",
          "totalLandOwned": "拥有土地总量",
          "totalFacilities": "设施总数",
          "activeFacilities": "活跃设施"
        }
      },

      "operations": {
        "type": {
          "ACCOUNT_CREATED": "账户创建",
          "TRANSFER_OUT": "转出",
          "TRANSFER_IN": "转入",
          "FACILITY_BUILD": "设施建造",
          "FACILITY_UPGRADE": "设施升级",
          "LAND_PURCHASE": "土地购买",
          "RAW_MATERIAL_PRODUCTION": "原材料生产",
          "PRODUCT_SALE": "产品销售",
          "UTILITY_CONSUMPTION": "公用事业消费",
          "TRADE_PURCHASE": "贸易采购"
        },
        "column": {
          "date": "日期",
          "type": "操作类型",
          "resource": "资源",
          "amount": "金额",
          "balance": "余额",
          "operator": "操作员",
          "description": "描述"
        }
      },

      "facilities": {
        "status": {
          "UNDER_CONSTRUCTION": "建设中",
          "ACTIVE": "运行中",
          "MAINTENANCE": "维护中",
          "DAMAGED": "已损坏",
          "DECOMMISSIONED": "已停用"
        },
        "category": {
          "RAW_MATERIAL_PRODUCTION": "原料生产设施",
          "FUNCTIONAL": "功能性设施",
          "INFRASTRUCTURE": "基础设施",
          "POPULATION_GROWTH": "人口增长设施"
        },
        "type": {
          "MINE": "矿场",
          "QUARRY": "采石场",
          "FOREST": "林场",
          "FARM": "农场",
          "RANCH": "养殖场",
          "FISHERY": "渔场",
          "FACTORY": "工厂",
          "MALL": "商场",
          "WAREHOUSE": "仓库",
          "WATER_PLANT": "水厂",
          "POWER_PLANT": "电厂",
          "BASE_STATION": "基站",
          "FIRE_STATION": "消防站",
          "SCHOOL": "学校",
          "HOSPITAL": "医院",
          "PARK": "公园",
          "CINEMA": "影院"
        }
      },

      "land": {
        "field": {
          "tileLocation": "地块位置",
          "landType": "土地类型",
          "ownedArea": "拥有面积",
          "totalInvestment": "总投资",
          "purchaseCount": "购买次数",
          "firstPurchase": "首次购买",
          "lastPurchase": "最近购买"
        }
      },

      "members": {
        "status": {
          "ACTIVE": "活跃",
          "INACTIVE": "非活跃",
          "PENDING": "待定"
        },
        "userType": {
          "1": "经理",
          "2": "员工",
          "3": "学生"
        },
        "column": {
          "username": "用户名",
          "email": "邮箱",
          "fullName": "全名",
          "userType": "用户类型",
          "status": "状态",
          "joinedAt": "加入日期",
          "lastLogin": "最后登录"
        }
      },

      "pagination": {
        "showing": "显示 {{start}}-{{end}} 共 {{total}} 条",
        "rowsPerPage": "每页行数：",
        "page": "第 {{current}} 页，共 {{total}} 页",
        "previous": "上一页",
        "next": "下一页",
        "first": "首页",
        "last": "末页"
      },

      "message": {
        "loading": "正在加载团队数据...",
        "noData": "未找到团队",
        "success": {
          "dataLoaded": "团队数据加载成功",
          "exported": "数据导出成功"
        },
        "error": {
          "loadFailed": "加载团队数据失败",
          "teamNotFound": "未找到团队",
          "unauthorized": "您无权查看此数据",
          "noActivity": "未找到活动注册"
        }
      },

      "action": {
        "refresh": "刷新",
        "export": "导出",
        "viewDetails": "查看详情",
        "back": "返回列表",
        "filter": "筛选",
        "clearFilter": "清除筛选"
      }
    }
  }
}
```

## Implementation Guidelines

### 1. Service Layer Implementation

```typescript
import { I18nService } from '@/common/i18n/i18n.service';

export class TeamStatusService {
  constructor(private readonly i18n: I18nService) {}

  async getTeamList(lang: string) {
    const teams = await this.fetchTeams();

    return teams.map(team => ({
      ...team,
      statusLabel: this.i18n.translate(
        `manager.teamStatus.table.cell.${team.isOpen ? 'openStatus' : 'closedStatus'}`,
        lang
      ),
      memberCountLabel: this.i18n.translate(
        'manager.teamStatus.table.cell.memberCount',
        lang,
        { current: team.memberCount, max: team.maxMembers }
      )
    }));
  }
}
```

### 2. Controller Implementation

```typescript
@Controller('api/manager')
export class TeamStatusController {
  @Get('teams')
  async getTeams(
    @Query('lang') lang: string = 'zh',
    @Headers('x-lang') headerLang?: string,
    @Headers('accept-language') acceptLanguage?: string
  ) {
    const language = this.resolveLanguage(lang, headerLang, acceptLanguage);
    const teams = await this.service.getTeamList(language);

    return {
      success: true,
      message: this.i18n.translate(
        'manager.teamStatus.message.success.dataLoaded',
        language
      ),
      data: teams
    };
  }
}
```

### 3. Error Message Localization

```typescript
export class TeamStatusExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const lang = this.extractLanguage(host);

    if (exception instanceof TeamNotFoundException) {
      return {
        success: false,
        message: this.i18n.translate(
          'manager.teamStatus.message.error.teamNotFound',
          lang
        ),
        businessCode: 2001
      };
    }
  }
}
```

## Number and Date Formatting

### Number Formatting

```typescript
interface NumberFormatConfig {
  en: {
    decimal: '.',
    thousands: ',',
    currency: '$',
    currencyPosition: 'prefix'
  },
  zh: {
    decimal: '.',
    thousands: ',',
    currency: '¥',
    currencyPosition: 'prefix'
  }
}

function formatNumber(value: number, lang: string): string {
  const formatter = new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US');
  return formatter.format(value);
}

function formatCurrency(value: number, lang: string, currency: 'GOLD' | 'CARBON'): string {
  if (currency === 'GOLD') {
    return `${formatNumber(value, lang)} G`;
  }
  return `${formatNumber(value, lang)} C`;
}
```

### Date Formatting

```typescript
interface DateFormatConfig {
  en: {
    short: 'MM/DD/YYYY',
    long: 'MMMM DD, YYYY',
    datetime: 'MM/DD/YYYY HH:mm',
    relative: true
  },
  zh: {
    short: 'YYYY年MM月DD日',
    long: 'YYYY年MM月DD日',
    datetime: 'YYYY年MM月DD日 HH:mm',
    relative: true
  }
}

function formatDate(date: Date, lang: string, format: 'short' | 'long' | 'datetime'): string {
  const formatter = new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: format === 'short' ? '2-digit' : 'long',
    day: '2-digit',
    ...(format === 'datetime' && {
      hour: '2-digit',
      minute: '2-digit'
    })
  });

  return formatter.format(date);
}

function formatRelativeTime(date: Date, lang: string): string {
  const rtf = new Intl.RelativeTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    numeric: 'auto'
  });

  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return rtf.format(-seconds, 'second');
}
```

## Validation Messages

### Validation Message Keys

```typescript
const validationMessages = {
  en: {
    'validation.required': '{{field}} is required',
    'validation.min': '{{field}} must be at least {{min}}',
    'validation.max': '{{field}} must be at most {{max}}',
    'validation.invalid': '{{field}} is invalid'
  },
  zh: {
    'validation.required': '{{field}}是必填项',
    'validation.min': '{{field}}不能少于{{min}}',
    'validation.max': '{{field}}不能超过{{max}}',
    'validation.invalid': '{{field}}无效'
  }
};
```

## Testing i18n

### Unit Test Example

```typescript
describe('TeamStatusController i18n', () => {
  it('should return Chinese messages by default', async () => {
    const response = await controller.getTeams();
    expect(response.message).toBe('团队数据加载成功');
  });

  it('should return English messages when requested', async () => {
    const response = await controller.getTeams('en');
    expect(response.message).toBe('Team data loaded successfully');
  });

  it('should format numbers according to locale', async () => {
    const team = await service.formatTeamData(mockTeam, 'zh');
    expect(team.goldBalance).toBe('15,000.50');

    const teamEn = await service.formatTeamData(mockTeam, 'en');
    expect(teamEn.goldBalance).toBe('15,000.50');
  });
});
```

## Best Practices

1. **Always use translation keys** - Never hardcode strings
2. **Keep keys semantic** - Use meaningful, hierarchical keys
3. **Include context in keys** - Differentiate similar translations
4. **Handle missing translations** - Fallback to key or default language
5. **Cache translations** - Avoid repeated file reads
6. **Validate translation files** - Ensure all keys exist in all languages
7. **Use interpolation** - Dynamic values with {{placeholder}}
8. **Format consistently** - Use locale-specific formatting for numbers and dates