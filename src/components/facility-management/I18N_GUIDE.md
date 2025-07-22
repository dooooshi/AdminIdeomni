# Facility Management i18n Guide

This guide provides comprehensive information about internationalization (i18n) support in the Facility Management module.

## Overview

The facility management module provides complete i18n support for:
- **English (en-US)** - Default language
- **Chinese Simplified (zh-CN)** - Full translation coverage

## Translation Coverage

### 🎯 **Complete Translation Support**

#### **Facility Types & Categories**
- ✅ All 18 facility types with detailed descriptions
- ✅ 4 facility categories with descriptions
- ✅ Consistent naming conventions (`FACILITY_TYPE_*`, `FACILITY_CATEGORY_*`)

#### **UI Components**
- ✅ Form labels, placeholders, and tooltips
- ✅ Button labels and actions
- ✅ Table headers and column names
- ✅ Status indicators and badges
- ✅ Error messages and validation text
- ✅ Success messages and confirmations

#### **Advanced Features**
- ✅ Environmental impact indicators
- ✅ Resource requirements and metrics
- ✅ Accessibility features
- ✅ Safety and compliance terms
- ✅ Performance metrics
- ✅ Bulk operations and import/export

## Usage Examples

### Basic Translation

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      {t('facilityManagement.FACILITY_MANAGEMENT')}
      {t('facilityManagement.CREATE_FACILITY')}
    </div>
  );
};
```

### Using the Facility Translation Helper

```typescript
import { useFacilityTranslation } from '@/components/facility-management';
import { FacilityType, FacilityCategory } from '@/lib/services/facilityService';

const FacilityComponent = () => {
  const {
    getFacilityTypeName,
    getFacilityCategoryName,
    formatCurrency,
    formatCapacity,
    getStatusText,
    t
  } = useFacilityTranslation();
  
  return (
    <div>
      {/* Facility type name */}
      <h3>{getFacilityTypeName(FacilityType.MINE)}</h3>
      
      {/* Category name */}
      <p>{getFacilityCategoryName(FacilityCategory.RAW_MATERIAL_PRODUCTION)}</p>
      
      {/* Formatted values */}
      <span>{formatCurrency(150000)}</span>
      <span>{formatCapacity(5000)}</span>
      
      {/* Status text */}
      <span>{getStatusText(true, false)}</span>
      
      {/* Direct translation */}
      <button>{t('CREATE_FACILITY')}</button>
    </div>
  );
};
```

### Form with Validation

```typescript
const FacilityForm = () => {
  const {
    getValidationError,
    getPlaceholder,
    getTooltip,
    getSuccessMessage
  } = useFacilityTranslation();
  
  return (
    <form>
      <TextField
        label={t('FACILITY_NAME')}
        placeholder={getPlaceholder('FACILITY_NAME')}
        title={getTooltip('FACILITY_TYPE')}
        error={getValidationError('NAME', 'REQUIRED')}
      />
      
      {/* Success message */}
      {success && (
        <Alert severity="success">
          {getSuccessMessage('CREATED')}
        </Alert>
      )}
    </form>
  );
};
```

### Dropdown with Translated Options

```typescript
const TypeSelector = () => {
  const { getAllFacilityTypes, getFacilityTypesByCategory } = useFacilityTranslation();
  
  // Get all types
  const allTypes = getAllFacilityTypes();
  
  // Get types by category
  const productionTypes = getFacilityTypesByCategory(FacilityCategory.RAW_MATERIAL_PRODUCTION);
  
  return (
    <Select>
      {allTypes.map(({ value, label }) => (
        <MenuItem key={value} value={value}>
          {label}
        </MenuItem>
      ))}
    </Select>
  );
};
```

## Translation Key Conventions

### Naming Patterns

#### **Facility Types**
```
FACILITY_TYPE_{TYPE_NAME}               // e.g., FACILITY_TYPE_MINE
FACILITY_TYPE_{TYPE_NAME}_DESCRIPTION   // e.g., FACILITY_TYPE_MINE_DESCRIPTION
```

#### **Facility Categories**
```
FACILITY_CATEGORY_{CATEGORY_NAME}       // e.g., FACILITY_CATEGORY_RAW_MATERIAL_PRODUCTION
```

#### **Actions**
```
{ACTION}_FACILITY                       // e.g., CREATE_FACILITY, EDIT_FACILITY
{ENTITY}_{ACTION}_SUCCESS              // e.g., FACILITY_CREATED_SUCCESS
ERROR_{ACTION}_{ENTITY}                // e.g., ERROR_CREATING_FACILITY
```

#### **Form Fields**
```
{FIELD_NAME}                           // e.g., FACILITY_NAME, CAPACITY
{FIELD_NAME}_TOOLTIP                   // e.g., CAPACITY_TOOLTIP
{FIELD_NAME}_PLACEHOLDER               // e.g., FACILITY_NAME_PLACEHOLDER
{FIELD_NAME}_{VALIDATION_TYPE}         // e.g., NAME_REQUIRED, CAPACITY_INVALID
```

### Available Translation Keys

#### **Core Actions**
- `CREATE_FACILITY`, `EDIT_FACILITY`, `DELETE_FACILITY`, `RESTORE_FACILITY`
- `VIEW_FACILITY`, `DUPLICATE_FACILITY`, `TOGGLE_STATUS`
- `REFRESH_DATA`, `EXPORT_DATA`, `SEARCH_FACILITIES`

#### **Common UI Elements**
- `EDIT`, `DELETE`, `RESTORE`, `VIEW`, `SAVE`, `CANCEL`, `CLOSE`
- `CONFIRM`, `YES`, `NO`, `OK`, `APPLY`, `RESET`, `CLEAR`
- `SEARCH`, `FILTER`, `SORT`, `REFRESH`, `LOAD_MORE`

#### **States**
- `ACTIVE`, `INACTIVE`, `DELETED`, `PENDING`
- `LOADING`, `SAVING`, `DELETING`, `RESTORING`, `UPDATING`
- `SUCCESS`, `ERROR`, `WARNING`, `INFO`

#### **Data States**
- `NO_DATA`, `NO_RESULTS`, `EMPTY_LIST`, `NOT_AVAILABLE`, `UNKNOWN`

## Formatting Utilities

### Currency Formatting
```typescript
const { formatCurrency } = useFacilityTranslation();

// English: $150,000
// Chinese: ¥150,000
formatCurrency(150000);
```

### Capacity Formatting
```typescript
const { formatCapacity } = useFacilityTranslation();

// English: 5,000 units
// Chinese: 5,000 单位
formatCapacity(5000);
```

### Date Formatting
```typescript
const { formatDate, formatDateShort } = useFacilityTranslation();

// Full format
formatDate(new Date()); // "Jan 15, 2025, 10:30 AM" / "2025年1月15日 10:30"

// Short format  
formatDateShort(new Date()); // "Jan 15, 2025" / "2025年1月15日"
```

## Advanced Features

### Environmental Impact with Colors
```typescript
const { getEnvironmentalImpact } = useFacilityTranslation();

const impact = getEnvironmentalImpact('HIGH');
// Returns: { text: "High Impact", color: "#f44336" }

<Chip 
  label={impact.text} 
  style={{ backgroundColor: impact.color }} 
/>
```

### Pluralization
```typescript
const { getPlural } = useFacilityTranslation();

// English: "1 facility" / "5 facilities"
// Chinese: "1 设施" / "5 设施" (no pluralization)
getPlural(count, 'FACILITY');
```

### Confirmation Messages
```typescript
const { getConfirmationMessage } = useFacilityTranslation();

const message = getConfirmationMessage('DELETE', facilityName);
// "Are you sure you want to delete {facilityName}? This action cannot be undone."
```

## Language-Specific Considerations

### English (en-US)
- Uses standard pluralization rules
- Currency: USD ($)
- Date format: Month Day, Year
- Number format: 1,000.00

### Chinese Simplified (zh-CN)
- No pluralization (same form for singular/plural)
- Currency: CNY (¥)
- Date format: Year年Month月Day日
- Number format: 1,000.00

## Best Practices

### 1. Always Use Translation Keys
```typescript
// ✅ Good
<Button>{t('CREATE_FACILITY')}</Button>

// ❌ Bad
<Button>Create Facility</Button>
```

### 2. Use the Facility Translation Helper
```typescript
// ✅ Good - Type-safe and consistent
const { getFacilityTypeName } = useFacilityTranslation();
<span>{getFacilityTypeName(facility.type)}</span>

// ❌ Bad - Manual string concatenation
<span>{t(`FACILITY_TYPE_${facility.type}`)}</span>
```

### 3. Handle Missing Translations Gracefully
```typescript
// ✅ Good - Fallback handling
const displayName = getFacilityTypeName(type) || type;

// ✅ Good - Use NOT_AVAILABLE for null/undefined
const cost = formatCurrency(facility.cost); // Returns "N/A" if null
```

### 4. Use Semantic Keys
```typescript
// ✅ Good - Semantic meaning
t('FACILITY_CREATED_SUCCESS')

// ❌ Bad - Generic meaning
t('SUCCESS_MESSAGE')
```

### 5. Leverage Formatting Utilities
```typescript
// ✅ Good - Locale-aware formatting
formatCurrency(cost)
formatDate(createdAt)

// ❌ Bad - Manual formatting
`$${cost.toLocaleString()}`
```

## Testing i18n

### Language Switching
```typescript
// Test language switching
const { i18n } = useTranslation();

// Switch to Chinese
await i18n.changeLanguage('zh-CN');

// Switch to English
await i18n.changeLanguage('en-US');
```

### Testing Translations
```typescript
// Mock translations in tests
const mockT = jest.fn((key) => key);
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: { language: 'en-US' }
  })
}));
```

## Extending Translations

### Adding New Keys
1. Add to both `en-US/facilityManagement.ts` and `zh-CN/facilityManagement.ts`
2. Follow naming conventions
3. Update the translation helper if needed
4. Test in both languages

### Adding New Languages
1. Create new locale file: `src/@i18n/locales/{locale}/facilityManagement.ts`
2. Add to locale index files
3. Update formatting utilities in `i18nHelper.ts`
4. Test thoroughly

## Troubleshooting

### Common Issues

1. **Missing Translation Key**
   - Check key exists in both language files
   - Verify correct namespace (`facilityManagement.KEY`)

2. **Incorrect Formatting**
   - Use provided formatting utilities
   - Check locale detection logic

3. **Type Errors**
   - Use the `useFacilityTranslation` helper for type safety
   - Import correct types from service files

4. **Performance Issues**
   - Translation functions are memoized
   - Avoid creating new translation objects in render loops

This comprehensive i18n system ensures a consistent, professional, and accessible user experience across all supported languages in the facility management module. 