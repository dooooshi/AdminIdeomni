# MTO Type 2 Internationalization (i18n) Design

## Overview

This document outlines the comprehensive internationalization support for MTO Type 2, ensuring seamless operation in both English and Chinese languages with proper localization of all text, numbers, dates, and currency values.

## Supported Languages

- **English (en)**: Default language for international users
- **Chinese (zh)**: Primary language for domestic users

## Translation Structure

### 1. Translation Keys Organization

Translation keys follow a hierarchical structure for MTO Type 2:

```
mto.type2.
├── status.          // Status labels
├── fields.          // Field names
├── actions.         // Action buttons
├── messages.        // User messages
├── errors.          // Error messages
├── notifications.   // Notification texts
├── reports.         // Report labels
└── help.           // Help texts
```

## 2. Status Labels

### 2.1 MTO Type 2 Status

**English (en.json)**:
```json
{
  "mto.type2.status.draft": "Draft",
  "mto.type2.status.released": "Released",
  "mto.type2.status.inProgress": "In Progress",
  "mto.type2.status.settling": "Settling",
  "mto.type2.status.settled": "Settled",
  "mto.type2.status.cancelled": "Cancelled"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.status.draft": "草稿",
  "mto.type2.status.released": "已发布",
  "mto.type2.status.inProgress": "进行中",
  "mto.type2.status.settling": "结算中",
  "mto.type2.status.settled": "已结算",
  "mto.type2.status.cancelled": "已取消"
}
```

### 2.2 Submission Status

**English (en.json)**:
```json
{
  "mto.type2.submission.status.pending": "Pending",
  "mto.type2.submission.status.partial": "Partially Settled",
  "mto.type2.submission.status.full": "Fully Settled",
  "mto.type2.submission.status.unsettled": "Unsettled",
  "mto.type2.submission.status.returned": "Returned"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.submission.status.pending": "待处理",
  "mto.type2.submission.status.partial": "部分结算",
  "mto.type2.submission.status.full": "全部结算",
  "mto.type2.submission.status.unsettled": "未结算",
  "mto.type2.submission.status.returned": "已退回"
}
```

## 3. Field Labels

### 3.1 Configuration Fields

**English (en.json)**:
```json
{
  "mto.type2.fields.productFormula": "Product Formula",
  "mto.type2.fields.releaseTime": "Release Time",
  "mto.type2.fields.settlementTime": "Settlement Time",
  "mto.type2.fields.overallBudget": "Overall Budget",
  "mto.type2.fields.actualSpent": "Actual Spent",
  "mto.type2.fields.utilizationRate": "Utilization Rate",
  "mto.type2.fields.participatingMalls": "Participating MALLs",
  "mto.type2.fields.totalSubmissions": "Total Submissions"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.fields.productFormula": "产品配方",
  "mto.type2.fields.releaseTime": "发布时间",
  "mto.type2.fields.settlementTime": "结算时间",
  "mto.type2.fields.overallBudget": "总预算",
  "mto.type2.fields.actualSpent": "实际支出",
  "mto.type2.fields.utilizationRate": "预算使用率",
  "mto.type2.fields.participatingMalls": "参与商城数",
  "mto.type2.fields.totalSubmissions": "总提交数"
}
```

### 3.2 Submission Fields

**English (en.json)**:
```json
{
  "mto.type2.fields.mall": "MALL",
  "mto.type2.fields.mallName": "MALL Name",
  "mto.type2.fields.tileName": "Tile Name",
  "mto.type2.fields.productNumber": "Product Quantity",
  "mto.type2.fields.unitPrice": "Unit Price",
  "mto.type2.fields.totalValue": "Total Value",
  "mto.type2.fields.settledQuantity": "Settled Quantity",
  "mto.type2.fields.settledValue": "Settled Value",
  "mto.type2.fields.unsettledQuantity": "Unsettled Quantity",
  "mto.type2.fields.submittedAt": "Submitted At"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.fields.mall": "商城",
  "mto.type2.fields.mallName": "商城名称",
  "mto.type2.fields.tileName": "地块名称",
  "mto.type2.fields.productNumber": "产品数量",
  "mto.type2.fields.unitPrice": "单价",
  "mto.type2.fields.totalValue": "总价值",
  "mto.type2.fields.settledQuantity": "已结算数量",
  "mto.type2.fields.settledValue": "已结算金额",
  "mto.type2.fields.unsettledQuantity": "未结算数量",
  "mto.type2.fields.submittedAt": "提交时间"
}
```

### 3.3 Budget Distribution Fields

**English (en.json)**:
```json
{
  "mto.type2.fields.tilePopulation": "Tile Population",
  "mto.type2.fields.populationRatio": "Population Ratio",
  "mto.type2.fields.allocatedBudget": "Allocated Budget",
  "mto.type2.fields.spentBudget": "Spent Budget",
  "mto.type2.fields.remainingBudget": "Remaining Budget",
  "mto.type2.fields.mallCount": "MALL Count",
  "mto.type2.fields.purchasedNumber": "Purchased Quantity"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.fields.tilePopulation": "地块人口",
  "mto.type2.fields.populationRatio": "人口比例",
  "mto.type2.fields.allocatedBudget": "分配预算",
  "mto.type2.fields.spentBudget": "已用预算",
  "mto.type2.fields.remainingBudget": "剩余预算",
  "mto.type2.fields.mallCount": "商城数量",
  "mto.type2.fields.purchasedNumber": "采购数量"
}
```

## 4. Action Labels

**English (en.json)**:
```json
{
  "mto.type2.actions.create": "Create MTO Type 2",
  "mto.type2.actions.edit": "Edit",
  "mto.type2.actions.release": "Release",
  "mto.type2.actions.cancel": "Cancel",
  "mto.type2.actions.settle": "Settle",
  "mto.type2.actions.submit": "Submit Products",
  "mto.type2.actions.updateSubmission": "Update Submission",
  "mto.type2.actions.withdrawSubmission": "Withdraw Submission",
  "mto.type2.actions.viewDetails": "View Details",
  "mto.type2.actions.downloadReport": "Download Report",
  "mto.type2.actions.requestReturn": "Request Return",
  "mto.type2.actions.confirmReturn": "Confirm Return"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.actions.create": "创建竞价采购",
  "mto.type2.actions.edit": "编辑",
  "mto.type2.actions.release": "发布",
  "mto.type2.actions.cancel": "取消",
  "mto.type2.actions.settle": "结算",
  "mto.type2.actions.submit": "提交产品",
  "mto.type2.actions.updateSubmission": "更新提交",
  "mto.type2.actions.withdrawSubmission": "撤回提交",
  "mto.type2.actions.viewDetails": "查看详情",
  "mto.type2.actions.downloadReport": "下载报告",
  "mto.type2.actions.requestReturn": "申请退货",
  "mto.type2.actions.confirmReturn": "确认退货"
}
```

## 5. User Messages

### 5.1 Success Messages

**English (en.json)**:
```json
{
  "mto.type2.messages.createSuccess": "MTO Type 2 created successfully",
  "mto.type2.messages.releaseSuccess": "MTO Type 2 has been released to MALL owners",
  "mto.type2.messages.cancelSuccess": "MTO Type 2 has been cancelled",
  "mto.type2.messages.settlementInitiated": "Settlement process has been initiated",
  "mto.type2.messages.settlementCompleted": "Settlement completed successfully",
  "mto.type2.messages.submissionSuccess": "Your products have been submitted successfully",
  "mto.type2.messages.submissionUpdated": "Your submission has been updated",
  "mto.type2.messages.submissionWithdrawn": "Your submission has been withdrawn",
  "mto.type2.messages.returnInitiated": "Product return has been initiated",
  "mto.type2.messages.returnCompleted": "Products have been returned to your facility"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.messages.createSuccess": "竞价采购创建成功",
  "mto.type2.messages.releaseSuccess": "竞价采购已发布给商城所有者",
  "mto.type2.messages.cancelSuccess": "竞价采购已取消",
  "mto.type2.messages.settlementInitiated": "结算流程已启动",
  "mto.type2.messages.settlementCompleted": "结算成功完成",
  "mto.type2.messages.submissionSuccess": "您的产品已成功提交",
  "mto.type2.messages.submissionUpdated": "您的提交已更新",
  "mto.type2.messages.submissionWithdrawn": "您的提交已撤回",
  "mto.type2.messages.returnInitiated": "产品退货已启动",
  "mto.type2.messages.returnCompleted": "产品已退回到您的设施"
}
```

### 5.2 Information Messages

**English (en.json)**:
```json
{
  "mto.type2.messages.noMallFacility": "You need a MALL facility to participate in this MTO",
  "mto.type2.messages.submissionWindowOpen": "Submission window is now open",
  "mto.type2.messages.submissionWindowClosed": "Submission window has closed",
  "mto.type2.messages.settlementInProgress": "Settlement is currently in progress",
  "mto.type2.messages.budgetAllocated": "Budget has been allocated based on MALL tile populations",
  "mto.type2.messages.pricesHidden": "Submission prices are hidden until settlement",
  "mto.type2.messages.returnDeadline": "Return deadline: {deadline}",
  "mto.type2.messages.transportationFee": "Transportation fee: {fee} gold"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.messages.noMallFacility": "您需要拥有商城设施才能参与此采购",
  "mto.type2.messages.submissionWindowOpen": "提交窗口现已开放",
  "mto.type2.messages.submissionWindowClosed": "提交窗口已关闭",
  "mto.type2.messages.settlementInProgress": "正在进行结算",
  "mto.type2.messages.budgetAllocated": "预算已根据商城地块人口分配",
  "mto.type2.messages.pricesHidden": "提交价格在结算前保密",
  "mto.type2.messages.returnDeadline": "退货截止日期：{deadline}",
  "mto.type2.messages.transportationFee": "运输费用：{fee} 金币"
}
```

## 6. Error Messages

### 6.1 Validation Errors

**English (en.json)**:
```json
{
  "mto.type2.errors.invalidReleaseTime": "Release time must be in the future",
  "mto.type2.errors.invalidSettlementTime": "Settlement time must be after release time",
  "mto.type2.errors.invalidBudget": "Budget must be greater than zero",
  "mto.type2.errors.noMallFacility": "You do not own any MALL facilities",
  "mto.type2.errors.mallNotOperational": "Your MALL is not operational",
  "mto.type2.errors.insufficientProducts": "Insufficient products in MALL inventory",
  "mto.type2.errors.invalidUnitPrice": "Unit price must be positive",
  "mto.type2.errors.formulaMismatch": "Products do not match the required formula",
  "mto.type2.errors.submissionExists": "You have already submitted from this MALL",
  "mto.type2.errors.submissionWindowClosed": "Submission window is closed"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.errors.invalidReleaseTime": "发布时间必须是未来时间",
  "mto.type2.errors.invalidSettlementTime": "结算时间必须晚于发布时间",
  "mto.type2.errors.invalidBudget": "预算必须大于零",
  "mto.type2.errors.noMallFacility": "您没有拥有任何商城设施",
  "mto.type2.errors.mallNotOperational": "您的商城未运营",
  "mto.type2.errors.insufficientProducts": "商城库存产品不足",
  "mto.type2.errors.invalidUnitPrice": "单价必须为正数",
  "mto.type2.errors.formulaMismatch": "产品不符合所需配方",
  "mto.type2.errors.submissionExists": "您已从此商城提交",
  "mto.type2.errors.submissionWindowClosed": "提交窗口已关闭"
}
```

### 6.2 Business Rule Errors

**English (en.json)**:
```json
{
  "mto.type2.errors.cannotEditReleased": "Cannot edit MTO after release",
  "mto.type2.errors.cannotCancelSettling": "Cannot cancel during settlement",
  "mto.type2.errors.settlementFailed": "Settlement process failed: {reason}",
  "mto.type2.errors.paymentFailed": "Payment processing failed",
  "mto.type2.errors.noUnsettledProducts": "No unsettled products to return",
  "mto.type2.errors.returnDeadlinePassed": "Return deadline has passed",
  "mto.type2.errors.insufficientBalance": "Insufficient balance for transportation fee",
  "mto.type2.errors.facilityCapacityExceeded": "Target facility capacity exceeded"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.errors.cannotEditReleased": "发布后无法编辑",
  "mto.type2.errors.cannotCancelSettling": "结算期间无法取消",
  "mto.type2.errors.settlementFailed": "结算流程失败：{reason}",
  "mto.type2.errors.paymentFailed": "支付处理失败",
  "mto.type2.errors.noUnsettledProducts": "没有未结算产品可退回",
  "mto.type2.errors.returnDeadlinePassed": "退货截止日期已过",
  "mto.type2.errors.insufficientBalance": "余额不足以支付运输费",
  "mto.type2.errors.facilityCapacityExceeded": "目标设施容量已满"
}
```

## 7. Notifications

### 7.1 System Notifications

**English (en.json)**:
```json
{
  "mto.type2.notifications.released.title": "New MTO Type 2 Available",
  "mto.type2.notifications.released.body": "A new competitive bidding opportunity for {formulaName} is now open for submissions",
  "mto.type2.notifications.cancelled.title": "MTO Type 2 Cancelled",
  "mto.type2.notifications.cancelled.body": "The MTO Type 2 for {formulaName} has been cancelled",
  "mto.type2.notifications.settlementStarting.title": "Settlement Starting",
  "mto.type2.notifications.settlementStarting.body": "Settlement process is starting for {formulaName}",
  "mto.type2.notifications.settlementCompleted.title": "Settlement Completed",
  "mto.type2.notifications.settlementCompleted.body": "Settlement has been completed for {formulaName}"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.notifications.released.title": "新竞价采购可用",
  "mto.type2.notifications.released.body": "{formulaName}的竞价采购机会现已开放提交",
  "mto.type2.notifications.cancelled.title": "竞价采购已取消",
  "mto.type2.notifications.cancelled.body": "{formulaName}的竞价采购已被取消",
  "mto.type2.notifications.settlementStarting.title": "结算开始",
  "mto.type2.notifications.settlementStarting.body": "{formulaName}的结算流程正在开始",
  "mto.type2.notifications.settlementCompleted.title": "结算完成",
  "mto.type2.notifications.settlementCompleted.body": "{formulaName}的结算已完成"
}
```

### 7.2 Team-Specific Notifications

**English (en.json)**:
```json
{
  "mto.type2.notifications.submissionSettled.title": "Your Submission Settled",
  "mto.type2.notifications.submissionSettled.body": "Sold {quantity} units at {unitPrice} per unit. Total revenue: {revenue}",
  "mto.type2.notifications.partialSettlement.title": "Partial Settlement",
  "mto.type2.notifications.partialSettlement.body": "{settledQuantity} of {totalQuantity} units were sold. {unsettledQuantity} units remain unsettled",
  "mto.type2.notifications.noSettlement.title": "Products Not Settled",
  "mto.type2.notifications.noSettlement.body": "Your submission was not selected during settlement. All {quantity} units remain unsettled",
  "mto.type2.notifications.returnReminder.title": "Return Deadline Approaching",
  "mto.type2.notifications.returnReminder.body": "You have {days} days to return {quantity} unsettled products"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.notifications.submissionSettled.title": "您的提交已结算",
  "mto.type2.notifications.submissionSettled.body": "以每单位{unitPrice}售出{quantity}单位。总收入：{revenue}",
  "mto.type2.notifications.partialSettlement.title": "部分结算",
  "mto.type2.notifications.partialSettlement.body": "{totalQuantity}单位中的{settledQuantity}已售出。{unsettledQuantity}单位未结算",
  "mto.type2.notifications.noSettlement.title": "产品未结算",
  "mto.type2.notifications.noSettlement.body": "您的提交在结算中未被选中。所有{quantity}单位仍未结算",
  "mto.type2.notifications.returnReminder.title": "退货截止日期临近",
  "mto.type2.notifications.returnReminder.body": "您还有{days}天时间退回{quantity}个未结算产品"
}
```

## 8. Reports and Analytics

### 8.1 Settlement Report

**English (en.json)**:
```json
{
  "mto.type2.reports.settlementReport": "Settlement Report",
  "mto.type2.reports.executiveSummary": "Executive Summary",
  "mto.type2.reports.budgetUtilization": "Budget Utilization",
  "mto.type2.reports.priceAnalysis": "Price Analysis",
  "mto.type2.reports.tileBreakdown": "Tile Breakdown",
  "mto.type2.reports.topSuppliers": "Top Suppliers",
  "mto.type2.reports.averagePrice": "Average Price",
  "mto.type2.reports.priceRange": "Price Range",
  "mto.type2.reports.totalQuantityPurchased": "Total Quantity Purchased",
  "mto.type2.reports.marketConcentration": "Market Concentration",
  "mto.type2.reports.competitionIntensity": "Competition Intensity"
}
```

**Chinese (zh.json)**:
```json
{
  "mto.type2.reports.settlementReport": "结算报告",
  "mto.type2.reports.executiveSummary": "执行摘要",
  "mto.type2.reports.budgetUtilization": "预算使用率",
  "mto.type2.reports.priceAnalysis": "价格分析",
  "mto.type2.reports.tileBreakdown": "地块明细",
  "mto.type2.reports.topSuppliers": "顶级供应商",
  "mto.type2.reports.averagePrice": "平均价格",
  "mto.type2.reports.priceRange": "价格范围",
  "mto.type2.reports.totalQuantityPurchased": "总采购数量",
  "mto.type2.reports.marketConcentration": "市场集中度",
  "mto.type2.reports.competitionIntensity": "竞争强度"
}
```

## 9. Formatting Functions

### 9.1 Number Formatting

```typescript
function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

// Examples:
// formatNumber(1000000, 'en') → "1,000,000"
// formatNumber(1000000, 'zh') → "1,000,000"
```

### 9.2 Currency Formatting

```typescript
function formatCurrency(amount: number, locale: string): string {
  const currency = locale === 'zh' ? '金币' : 'gold';
  const formatted = formatNumber(amount, locale);
  return locale === 'zh' ? `${formatted} ${currency}` : `${formatted} ${currency}`;
}

// Examples:
// formatCurrency(1500.50, 'en') → "1,500.50 gold"
// formatCurrency(1500.50, 'zh') → "1,500.50 金币"
```

### 9.3 Date/Time Formatting

```typescript
function formatDateTime(date: Date, locale: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Intl.DateTimeFormat(locale, options).format(date);
}

// Examples:
// formatDateTime(date, 'en') → "03/15/2024, 02:30 PM"
// formatDateTime(date, 'zh') → "2024/03/15 14:30"
```

### 9.4 Percentage Formatting

```typescript
function formatPercentage(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

// Examples:
// formatPercentage(85.5, 'en') → "85.5%"
// formatPercentage(85.5, 'zh') → "85.5%"
```

## 10. Dynamic Message Interpolation

### 10.1 Message Template System

```typescript
interface MessageInterpolator {
  interpolate(key: string, params: Record<string, any>, locale: string): string;
}

class I18nMessageInterpolator implements MessageInterpolator {
  interpolate(key: string, params: Record<string, any>, locale: string): string {
    let message = this.getMessage(key, locale);

    // Replace placeholders with values
    Object.entries(params).forEach(([key, value]) => {
      const formattedValue = this.formatValue(value, locale);
      message = message.replace(`{${key}}`, formattedValue);
    });

    return message;
  }

  private formatValue(value: any, locale: string): string {
    if (typeof value === 'number') {
      return formatNumber(value, locale);
    }
    if (value instanceof Date) {
      return formatDateTime(value, locale);
    }
    return String(value);
  }
}
```

### 10.2 Usage Examples

```typescript
// Settlement notification
const message = i18n.interpolate(
  'mto.type2.notifications.submissionSettled.body',
  {
    quantity: 100,
    unitPrice: 50.5,
    revenue: 5050
  },
  'en'
);
// Result: "Sold 100 units at 50.5 per unit. Total revenue: 5,050"

// Return reminder
const reminderMessage = i18n.interpolate(
  'mto.type2.notifications.returnReminder.body',
  {
    days: 3,
    quantity: 25
  },
  'zh'
);
// Result: "您还有3天时间退回25个未结算产品"
```

## 11. Implementation Guidelines

### 11.1 Service Integration

```typescript
@Injectable()
export class MtoType2I18nService {
  constructor(private i18nService: I18nService) {}

  // Get translated status
  getStatusLabel(status: MtoType2Status, lang: string): string {
    return this.i18nService.translate(
      `mto.type2.status.${status.toLowerCase()}`,
      lang
    );
  }

  // Format settlement summary
  formatSettlementSummary(
    settlement: SettlementResult,
    lang: string
  ): SettlementSummaryI18n {
    return {
      title: this.i18nService.translate('mto.type2.reports.settlementReport', lang),
      budgetUtilization: formatPercentage(settlement.utilizationRate, lang),
      totalPurchased: formatNumber(settlement.totalQuantity, lang),
      totalSpent: formatCurrency(settlement.totalSpent, lang),
      averagePrice: formatCurrency(settlement.averagePrice, lang)
    };
  }

  // Generate notification message
  generateNotification(
    type: NotificationType,
    params: Record<string, any>,
    lang: string
  ): NotificationMessage {
    return {
      title: this.i18nService.translate(`mto.type2.notifications.${type}.title`, lang),
      body: this.i18nService.interpolate(
        `mto.type2.notifications.${type}.body`,
        params,
        lang
      )
    };
  }
}
```

### 11.2 API Response Localization

```typescript
@Injectable()
export class MtoType2ResponseFormatter {
  constructor(private i18nService: MtoType2I18nService) {}

  formatResponse(data: any, lang: string): LocalizedResponse {
    // Recursively localize all translatable fields
    return this.localizeObject(data, lang);
  }

  private localizeObject(obj: any, lang: string): any {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.localizeObject(item, lang));
    }

    if (typeof obj === 'object') {
      const localized: any = {};

      for (const [key, value] of Object.entries(obj)) {
        if (key === 'status') {
          localized[key] = value;
          localized[`${key}Label`] = this.i18nService.getStatusLabel(value as string, lang);
        } else if (key.endsWith('Time') || key.endsWith('At')) {
          localized[key] = value;
          localized[`${key}Formatted`] = formatDateTime(new Date(value as string), lang);
        } else if (key.includes('Price') || key.includes('Budget') || key.includes('Amount')) {
          localized[key] = value;
          localized[`${key}Formatted`] = formatCurrency(Number(value), lang);
        } else {
          localized[key] = this.localizeObject(value, lang);
        }
      }

      return localized;
    }

    return obj;
  }
}
```

## 12. Testing i18n

### 12.1 Translation Coverage Test

```typescript
describe('MTO Type 2 i18n Coverage', () => {
  it('should have all required translations', () => {
    const requiredKeys = [
      'mto.type2.status.draft',
      'mto.type2.status.released',
      // ... all other keys
    ];

    for (const lang of ['en', 'zh']) {
      for (const key of requiredKeys) {
        const translation = i18nService.translate(key, lang);
        expect(translation).not.toBe(key); // Should not return key itself
        expect(translation).toBeTruthy();
      }
    }
  });
});
```

### 12.2 Formatting Test

```typescript
describe('MTO Type 2 Formatting', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1000.50, 'en')).toBe('1,000.50 gold');
    expect(formatCurrency(1000.50, 'zh')).toBe('1,000.50 金币');
  });

  it('should format percentages correctly', () => {
    expect(formatPercentage(85.5, 'en')).toBe('85.5%');
    expect(formatPercentage(85.5, 'zh')).toBe('85.5%');
  });
});
```

## 13. Maintenance Guidelines

### 13.1 Adding New Translations

1. Add key to both language files simultaneously
2. Follow naming convention: `mto.type2.category.specificKey`
3. Test interpolation if placeholders are used
4. Update documentation

### 13.2 Translation Review Process

1. Technical review for key consistency
2. Language review by native speakers
3. Context testing in application
4. User acceptance testing

## Appendix: Complete Translation Files

Translation files are maintained in:
- `/src/common/i18n/translations/en/mto-type-2.json`
- `/src/common/i18n/translations/zh/mto-type-2.json`

These files contain all translations specific to MTO Type 2 functionality.