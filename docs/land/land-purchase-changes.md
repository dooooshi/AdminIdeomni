# Land Purchase System Changes

## Overview

This document outlines the major changes made to the land purchase system to remove area limitations and enforce integer-only area purchases.

## Changes Made

### 1. Removed Area Limitations

**Previous Behavior:**
- Each tile had a maximum area limit of 25 units
- Teams could not purchase more area than available on a tile
- Available area was calculated as `Math.max(0, 25 - totalOwnedArea)`

**New Behavior:**
- **Unlimited area purchases** - teams can purchase as much area as they can afford
- No restrictions on total area per tile
- Available area is set to 999999 (effectively unlimited)

### 2. Integer-Only Area Purchases

**Previous Behavior:**
- Area could be purchased in decimal values (e.g., 2.5 units)
- Minimum purchase was 0.001 units
- Maximum purchase was 100 units per transaction

**New Behavior:**
- **Area must be whole numbers only** (integers)
- Minimum purchase is 1 unit
- No maximum purchase limit (subject to team resources)

## API Changes

### Purchase Land DTO (`PurchaseLandDto`)

**Before:**
```typescript
@IsNumber({ maxDecimalPlaces: 3 })
@IsPositive()
@Min(0.001)
@Max(100)
@Transform(({ value }) => parseFloat(value))
area: number;
```

**After:**
```typescript
@IsInt()
@IsPositive()
@Min(1)
@Transform(({ value }) => parseInt(value))
area: number;
```

### API Response Changes

**Available Area:**
- Previous: Limited to remaining area (e.g., 22.5)
- Current: 999999 (unlimited)

**Area Examples:**
- Previous: Decimal examples (2.5, 3.25, etc.)
- Current: Integer examples (3, 4, etc.)

## Business Impact

### Advantages
1. **Simplified Logic**: No complex area availability calculations
2. **Unlimited Growth**: Teams can expand as much as resources allow
3. **Cleaner Data**: Integer-only areas are easier to work with
4. **Better Performance**: Removed area calculation overhead

### Considerations
1. **Resource Management**: Team resource balances become the only limiting factor
2. **Competition**: Less scarcity-based competition for tile areas
3. **Strategy Changes**: Teams can focus purely on resource optimization

## Implementation Details

### Files Modified

1. **DTOs**: `src/user/dto/land-purchase.dto.ts`
   - Updated validation rules to use `@IsInt()`
   - Changed all area examples to integers

2. **Services**: 
   - `src/user/land-purchase.service.ts` - Removed area limit validation
   - `src/user/land-view.service.ts` - Updated availableArea calculation
   - `src/user/manager-land.service.ts` - Updated availableArea calculation

3. **Repositories**: 
   - `src/user/tile-land-ownership.repository.ts` - Updated availableArea calculation

4. **Controllers**: 
   - `src/user/land-purchase.controller.ts` - Updated API examples

### Database Considerations

- **Existing Data**: Remains compatible (decimal values preserved)
- **New Purchases**: Will be integers only
- **Schema**: No database schema changes required

## Migration Notes

### For Frontend Applications
- Update validation to accept integers only
- Update UI to remove decimal input options
- Update area display to handle unlimited availability

### For API Clients
- **Breaking Change**: Decimal area values will be rejected
- Update request validation to use integers
- Expect unlimited `availableArea` values in responses

## Testing

All test files need to be updated to:
- Use integer area values instead of decimals
- Expect unlimited available area (999999)
- Remove area limit validation tests

## Rollback Plan

If rollback is needed:
1. Revert validation rules to accept decimals
2. Restore area limit calculations (25 units per tile)
3. Update API examples back to decimal values
4. Restore area availability checks in services

## Related Documentation

- [Land Purchase API Reference](land-api-reference.md)
- [Land Purchase User Guide](land-purchase-user-guide.md)
- [Land System Overview](land-system-overview.md)