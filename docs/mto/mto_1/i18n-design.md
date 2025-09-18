# MTO Type 1 Internationalization (i18n) Design

## Overview

This document defines the comprehensive internationalization strategy for the MTO Type 1 module, supporting multiple languages (English and Chinese) across all user-facing content.

## Supported Languages

- **English (en)**: Default for international users
- **Chinese (zh)**: Primary language for platform
- **Future**: Extensible to support additional languages

## i18n Architecture

### Language Detection Priority
1. Query parameter: `?lang=zh`
2. Header: `Accept-Language` or `x-lang`
3. User preference (stored in profile)
4. Default: Chinese (zh)

### Response Format
All API responses include language context:
```typescript
{
  "success": true,
  "businessCode": 0,
  "message": "{{translated_message}}",
  "data": {
    // Translated content
  },
  "timestamp": "2024-03-01T00:00:00Z",
  "lang": "zh",  // Current language
  "extra": {
    "availableLanguages": ["en", "zh"]
  }
}
```

## Translation Key Structure

### Hierarchical Organization
```
mto.type1.
├── common.                    # Common terms
├── status.                    # Status labels
├── fields.                    # Field names
├── messages.                  # User messages
├── errors.                    # Error messages
├── validation.                # Validation messages
├── calculation.               # Calculation descriptions
├── settlement.                # Settlement descriptions
├── business.                  # Business logic terms
└── api.                       # API-specific messages
```

## Translation Keys Definition

### 1. Common Terms
```yaml
mto.type1.common:
  title:
    en: "MTO Type 1 - Population-Based Procurement"
    zh: "MTO类型1 - 基于人口的采购"

  requirement:
    en: "Requirement"
    zh: "需求"

  delivery:
    en: "Delivery"
    zh: "交付"

  settlement:
    en: "Settlement"
    zh: "结算"

  product:
    en: "Product"
    zh: "产品"

  formula:
    en: "Formula"
    zh: "配方"

  tile:
    en: "Tile"
    zh: "地块"

  team:
    en: "Team"
    zh: "团队"

  manager:
    en: "Manager"
    zh: "经理"

  student:
    en: "Student"
    zh: "学生"
```

### 2. Status Labels
```yaml
mto.type1.status:
  DRAFT:
    en: "Draft"
    zh: "草稿"
    description:
      en: "Requirement is being configured"
      zh: "需求正在配置中"

  RELEASED:
    en: "Released"
    zh: "已发布"
    description:
      en: "Requirement is visible to teams"
      zh: "需求对团队可见"

  IN_PROGRESS:
    en: "In Progress"
    zh: "进行中"
    description:
      en: "Teams are delivering products"
      zh: "团队正在交付产品"

  SETTLING:
    en: "Settling"
    zh: "结算中"
    description:
      en: "Settlement process is running"
      zh: "正在进行结算"

  SETTLED:
    en: "Settled"
    zh: "已结算"
    description:
      en: "Settlement completed"
      zh: "结算完成"

  CANCELLED:
    en: "Cancelled"
    zh: "已取消"
    description:
      en: "Requirement has been cancelled"
      zh: "需求已被取消"
```

### 3. Field Names
```yaml
mto.type1.fields:
  managerProductFormulaId:
    en: "Product Formula"
    zh: "产品配方"

  purchaseGoldPrice:
    en: "Purchase Price (Gold)"
    zh: "采购价格（金币）"
    format:
      en: "{value} Gold"
      zh: "{value} 金币"

  basePurchaseNumber:
    en: "Base Purchase Quantity"
    zh: "基础采购数量"

  baseCountPopulationNumber:
    en: "Population Segment Size"
    zh: "人口段大小"

  overallPurchaseNumber:
    en: "Total Purchase Limit"
    zh: "总采购限额"

  overallPurchaseBudget:
    en: "Total Budget"
    zh: "总预算"
    format:
      en: "{value:currency} Gold"
      zh: "{value:currency} 金币"

  releaseTime:
    en: "Release Time"
    zh: "发布时间"

  settlementTime:
    en: "Settlement Time"
    zh: "结算时间"

  tilePopulation:
    en: "Tile Population"
    zh: "地块人口"

  requirementNumber:
    en: "Required Quantity"
    zh: "需求数量"

  deliveredNumber:
    en: "Delivered Quantity"
    zh: "已交付数量"

  settledNumber:
    en: "Settled Quantity"
    zh: "已结算数量"

  fulfillmentRate:
    en: "Fulfillment Rate"
    zh: "完成率"
    format:
      en: "{value}%"
      zh: "{value}%"
```

### 4. Messages
```yaml
mto.type1.messages:
  requirement:
    created:
      en: "MTO Type 1 requirement created successfully"
      zh: "MTO类型1需求创建成功"

    updated:
      en: "Requirement updated successfully"
      zh: "需求更新成功"

    released:
      en: "Requirement has been released to teams"
      zh: "需求已发布给团队"

    cancelled:
      en: "Requirement has been cancelled"
      zh: "需求已取消"

  delivery:
    submitted:
      en: "Delivery submitted successfully"
      zh: "交付提交成功"

    validated:
      en: "Products validated successfully"
      zh: "产品验证成功"

    rejected:
      en: "Some products were rejected"
      zh: "部分产品被拒绝"

  settlement:
    initiated:
      en: "Settlement process started"
      zh: "结算流程已开始"

    completed:
      en: "Settlement completed successfully"
      zh: "结算成功完成"

    payment:
      en: "Payment of {amount} Gold processed"
      zh: "已处理 {amount} 金币付款"

  return:
    requested:
      en: "Product return requested"
      zh: "已请求产品退回"

    completed:
      en: "Products returned to facility"
      zh: "产品已退回设施"
```

### 5. Error Messages
```yaml
mto.type1.errors:
  4001:
    en: "Insufficient balance for transportation fee"
    zh: "运输费余额不足"

  4002:
    en: "Products not owned by team"
    zh: "产品不属于团队"

  4003:
    en: "Formula validation failed - craft categories mismatch"
    zh: "配方验证失败 - 工艺类别不匹配"

  4004:
    en: "Delivery window closed"
    zh: "交付窗口已关闭"

  4005:
    en: "Tile requirement already fulfilled"
    zh: "地块需求已满足"

  4013:
    en: "Formula validation failed - missing required material {materialName}"
    zh: "配方验证失败 - 缺少必需材料 {materialName}"

  4014:
    en: "Formula validation failed - incorrect quantity for {materialName}"
    zh: "配方验证失败 - {materialName} 数量不正确"
    details:
      en: "Required: {required}, Provided: {provided}"
      zh: "需要：{required}，提供：{provided}"

  4015:
    en: "Formula validation failed - unauthorized material included"
    zh: "配方验证失败 - 包含未授权材料"
```

### 6. Validation Messages
```yaml
mto.type1.validation:
  releaseTime:
    future:
      en: "Release time must be in the future"
      zh: "发布时间必须在未来"

  settlementTime:
    afterRelease:
      en: "Settlement time must be after release time"
      zh: "结算时间必须在发布时间之后"

    minWindow:
      en: "Delivery window must be specified"
      zh: "必须指定交付窗口"

  population:
    threshold:
      en: "Base population must be greater than 1"
      zh: "基础人口必须大于1"

  price:
    positive:
      en: "Price must be positive"
      zh: "价格必须为正数"

  quantity:
    min:
      en: "Quantity must be at least {min}"
      zh: "数量至少为 {min}"

    max:
      en: "Quantity cannot exceed {max}"
      zh: "数量不能超过 {max}"
```

### 7. Calculation History Descriptions
```yaml
mto.type1.calculation:
  steps:
    INITIAL_CALCULATION:
      title:
        en: "Initial Calculation"
        zh: "初始计算"
      description:
        en: "Calculating requirements based on tile populations"
        zh: "基于地块人口计算需求"

    BUDGET_CONSTRAINT_CHECK:
      title:
        en: "Budget Constraint Check"
        zh: "预算约束检查"
      description:
        en: "Total requirement ({total}) exceeds limit ({limit})"
        zh: "总需求（{total}）超过限额（{limit}）"

    TILE_ELIMINATION:
      title:
        en: "Tile Elimination"
        zh: "地块消除"
      description:
        en: "Eliminated {count} tile(s) with maximum requirement {max}"
        zh: "消除了 {count} 个需求最大值为 {max} 的地块"

    FINAL_DISTRIBUTION:
      title:
        en: "Final Distribution"
        zh: "最终分配"
      description:
        en: "Distribution calculation complete"
        zh: "分配计算完成"

  reasons:
    budgetExceeded:
      en: "Exceeded budget allocation"
      zh: "超出预算分配"

    belowThreshold:
      en: "Population below minimum threshold"
      zh: "人口低于最低阈值"

    withinBudget:
      en: "Within budget constraints"
      zh: "在预算约束内"
```

### 8. Settlement History Descriptions
```yaml
mto.type1.settlement:
  steps:
    SETTLEMENT_INITIATED:
      title:
        en: "Settlement Initiated"
        zh: "结算已启动"
      description:
        en: "Settlement process started at {time}"
        zh: "结算流程于 {time} 开始"

    TILE_PROCESSING_START:
      title:
        en: "Processing Tile"
        zh: "处理地块"
      description:
        en: "Starting settlement for tile {tileName}"
        zh: "开始结算地块 {tileName}"

    PRODUCT_VALIDATION:
      title:
        en: "Product Validation"
        zh: "产品验证"
      description:
        en: "Validated {validated} products, settled {settled}, rejected {rejected}"
        zh: "验证了 {validated} 个产品，结算 {settled} 个，拒绝 {rejected} 个"

    PAYMENT_PROCESSING:
      title:
        en: "Payment Processing"
        zh: "付款处理"
      description:
        en: "Processed payment of {amount} Gold to team {teamName}"
        zh: "向团队 {teamName} 处理了 {amount} 金币付款"

    SETTLEMENT_COMPLETED:
      title:
        en: "Settlement Completed"
        zh: "结算完成"
      description:
        en: "Settlement completed in {duration}"
        zh: "结算在 {duration} 内完成"

  rejection:
    reasons:
      formulaMismatch:
        en: "Product formula mismatch"
        zh: "产品配方不匹配"

      requirementFulfilled:
        en: "Tile requirement already fulfilled"
        zh: "地块需求已满足"

      invalidProduct:
        en: "Product validation failed"
        zh: "产品验证失败"
```

### 9. Business Terms
```yaml
mto.type1.business:
  distributionMethod:
    populationBased:
      en: "Population-based distribution"
      zh: "基于人口的分配"

    budgetConstrained:
      en: "Budget-constrained allocation"
      zh: "预算约束分配"

  deliveryWindow:
    label:
      en: "Delivery Window"
      zh: "交付窗口"

    format:
      en: "{days} days, {hours} hours remaining"
      zh: "剩余 {days} 天 {hours} 小时"

    closed:
      en: "Delivery window closed"
      zh: "交付窗口已关闭"

  transportationFee:
    label:
      en: "Transportation Fee"
      zh: "运输费"

    calculation:
      en: "Distance: {distance} hex, Cost: {cost} Gold"
      zh: "距离：{distance} 格，费用：{cost} 金币"

  fifo:
    label:
      en: "First-In-First-Out Processing"
      zh: "先进先出处理"

    description:
      en: "Deliveries processed in order of submission"
      zh: "按提交顺序处理交付"
```

## Dynamic Content Handling

### 1. User-Generated Content
```typescript
interface DynamicContent {
  // Store original + translations
  productName: {
    original: string;      // Original input language
    translations?: {
      en?: string;
      zh?: string;
    };
  };
}
```

### 2. System-Generated Descriptions
```typescript
function generateDescription(template: string, params: object, lang: string): string {
  const translated = i18n.translate(template, lang);
  return interpolate(translated, params);
}

// Example
generateDescription(
  'mto.type1.calculation.steps.TILE_ELIMINATION.description',
  { count: 3, max: 800 },
  'zh'
);
// Output: "消除了 3 个需求最大值为 800 的地块"
```

### 3. Mixed Content
```typescript
interface MixedContentResponse {
  // System content (translated)
  status: string;           // Translated status label
  statusDescription: string; // Translated description

  // User content (original)
  productFormula: {
    name: string;          // Original name
    description?: string;  // Original description
  };

  // Formatted values
  price: {
    value: number;
    display: string;       // Localized format
  };
}
```

## Formatting Conventions

### 1. Numbers
```yaml
formatting.numbers:
  thousands:
    en: ","    # 1,000
    zh: ","    # 1,000

  decimal:
    en: "."    # 1.50
    zh: "."    # 1.50
```

### 2. Currency
```yaml
formatting.currency:
  gold:
    en: "{value} Gold"
    zh: "{value} 金币"

  largeAmount:
    en: "{value:shorthand}"  # 1.5M Gold
    zh: "{value:万}"          # 150万金币
```

### 3. Dates and Times
```yaml
formatting.datetime:
  full:
    en: "MMM DD, YYYY HH:mm:ss"  # Mar 01, 2024 14:30:00
    zh: "YYYY年MM月DD日 HH:mm:ss" # 2024年03月01日 14:30:00

  relative:
    en: "{value} {unit} ago"      # 5 minutes ago
    zh: "{value}{unit}前"          # 5分钟前

  duration:
    en: "{hours}h {minutes}m {seconds}s"
    zh: "{hours}小时{minutes}分{seconds}秒"
```

### 4. Percentages
```yaml
formatting.percentage:
  standard:
    en: "{value}%"
    zh: "{value}%"

  withLabel:
    en: "Completion: {value}%"
    zh: "完成度：{value}%"
```

## API Response Examples

### Manager View (English)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "MTO Type 1 requirement created successfully",
  "lang": "en",
  "data": {
    "id": 1,
    "status": "Released",
    "statusDescription": "Requirement is visible to teams",
    "formula": {
      "name": "Advanced Circuit Board",
      "displayName": "Advanced Circuit Board"
    },
    "purchasePrice": {
      "value": 100.50,
      "display": "100.50 Gold"
    },
    "overallBudget": {
      "value": 1005000,
      "display": "1,005,000 Gold"
    },
    "releaseTime": {
      "value": "2024-03-01T00:00:00Z",
      "display": "Mar 01, 2024 00:00:00"
    },
    "deliveryWindow": "4 days, 0 hours remaining"
  }
}
```

### Student View (Chinese)
```json
{
  "success": true,
  "businessCode": 0,
  "message": "交付提交成功",
  "lang": "zh",
  "data": {
    "deliveryId": "D123",
    "status": "待结算",
    "deliveredQuantity": {
      "value": 10,
      "display": "10 个产品"
    },
    "transportationFee": {
      "value": 50.00,
      "display": "50 金币"
    },
    "estimatedPayment": {
      "value": 1005.00,
      "display": "1,005 金币"
    },
    "deliveryTime": {
      "value": "2024-03-02T14:30:00Z",
      "display": "2024年03月02日 14:30:00"
    }
  }
}
```

## Implementation Guidelines

### 1. Service Layer
```typescript
@Injectable()
export class MtoType1I18nService {
  constructor(private i18nService: I18nService) {}

  translateStatus(status: MtoType1Status, lang: string): string {
    return this.i18nService.translate(`mto.type1.status.${status}`, lang);
  }

  translateError(code: number, lang: string, params?: object): string {
    return this.i18nService.translate(`mto.type1.errors.${code}`, lang, params);
  }

  formatCurrency(value: number, lang: string): string {
    const format = this.i18nService.translate('formatting.currency.gold', lang);
    return format.replace('{value}', value.toLocaleString(lang));
  }
}
```

### 2. Controller Integration
```typescript
@Controller('api/admin/mto-type1')
export class AdminMtoType1Controller {
  @Post('requirements')
  async create(@Body() dto: CreateDto, @Lang() lang: string) {
    const result = await this.service.create(dto);

    return {
      message: this.i18n.translate('mto.type1.messages.requirement.created', lang),
      data: this.formatResponse(result, lang)
    };
  }
}
```

### 3. Error Handling
```typescript
throw new BusinessException(
  4003,
  this.i18n.translate('mto.type1.errors.4003', lang)
);
```

## Translation File Structure

```
src/common/i18n/translations/
├── mto-type1/
│   ├── en/
│   │   ├── common.json
│   │   ├── status.json
│   │   ├── fields.json
│   │   ├── messages.json
│   │   ├── errors.json
│   │   ├── validation.json
│   │   ├── calculation.json
│   │   ├── settlement.json
│   │   └── business.json
│   └── zh/
│       ├── common.json
│       ├── status.json
│       ├── fields.json
│       ├── messages.json
│       ├── errors.json
│       ├── validation.json
│       ├── calculation.json
│       ├── settlement.json
│       └── business.json
└── index.ts
```

## Testing Strategy

### 1. Translation Coverage
- Ensure all user-facing strings have translations
- Test fallback behavior for missing translations
- Validate parameter interpolation

### 2. Format Testing
- Test number formatting in different locales
- Verify date/time display
- Check currency formatting

### 3. API Response Testing
```typescript
describe('MTO Type 1 i18n', () => {
  it('should return Chinese response by default', async () => {
    const response = await request(app)
      .get('/api/team/mto-type1/requirements')
      .expect(200);

    expect(response.body.lang).toBe('zh');
    expect(response.body.message).toBe('需求获取成功');
  });

  it('should return English response when requested', async () => {
    const response = await request(app)
      .get('/api/team/mto-type1/requirements?lang=en')
      .expect(200);

    expect(response.body.lang).toBe('en');
    expect(response.body.message).toBe('Requirements fetched successfully');
  });
});
```

## Maintenance Guidelines

### Adding New Languages
1. Create new language folder in translations
2. Translate all existing keys
3. Add language code to supported languages
4. Test all endpoints with new language

### Updating Translations
1. Update translation files
2. Clear translation cache if implemented
3. Test affected endpoints
4. Update documentation

### Key Naming Conventions
- Use dot notation for hierarchy
- Use camelCase for final keys
- Group related translations
- Keep keys descriptive but concise