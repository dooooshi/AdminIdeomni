# Migration: Land Purchase System - Student Only with Available Land Limits

**Date**: September 30, 2024
**Author**: System
**Type**: Breaking Change
**Affected Areas**: Land Purchase, User Roles, Admin Configuration

## Overview

The land purchase system has been updated to restrict land purchases to students only, with a shared available land limit per tile across all teams. This is a **breaking change** that requires frontend updates.

## Key Changes

### 1. User Type Restrictions

#### Before
- All user types (Manager, Worker, Student) could purchase land
- No user type validation

#### After
- **ONLY students (userType = 3) can purchase land**
- Manager (userType = 1) and Worker (userType = 2) are blocked from purchasing
- New error code: `ONLY_STUDENTS_CAN_PURCHASE_LAND`

### 2. Available Land Limits

#### New Database Field
- `MapTile.availableLand: Int` (default: 10)
- This represents the **total available land shared across ALL teams** on each tile
- Marine tiles have `availableLand = 0` (cannot be purchased)

#### Validation Rules
- Students must respect the available land limit
- Formula: `requestedArea + totalOwnedByAllTeams <= tile.availableLand`
- Error code: `LAND_PURCHASE_EXCEEDS_AVAILABLE`

### 3. Removed Features

- **Removed multiplier functionality** for available land configuration
- Only fixed values can be set by admins
- Removed `availableLandMultiplier` from all DTOs

## Frontend Changes Required

### 1. User Interface Updates

#### Land Purchase UI
- **Hide or disable** land purchase features for non-student users
- Check user type before showing purchase options:
  ```typescript
  const canPurchaseLand = user.userType === 3; // Only students
  ```

#### Role-Based Display
- Show appropriate messaging for different user types:
  - Students: Show full purchase interface with available land info
  - Managers/Workers: Show view-only interface or informational message

### 2. API Response Changes

#### `/api/user/land-purchase/available-tiles` Response

The `availableArea` field now correctly reflects the remaining available land:

```typescript
interface AvailableTileDto {
  tileId: number;
  axialQ: number;
  axialR: number;
  landType: string;
  currentGoldPrice?: number;
  currentCarbonPrice?: number;
  currentPopulation: number;
  totalOwnedArea: number;    // Total owned by ALL teams
  teamOwnedArea: number;      // Owned by current team
  availableArea: number;      // NEW: Remaining available for purchase (for students only)
  canPurchase: boolean;
}
```

**Important**: `availableArea` calculation:
- For students: `tile.availableLand - totalOwnedByAllTeams`
- For non-students: Always 0 (they cannot purchase anyway)

#### `/api/user/land-purchase/calculate-cost` Response

Now includes `availableArea` field:

```typescript
interface CalculateCostResponse {
  goldCost: number;
  carbonCost: number;
  totalCost: number;
  goldPrice: number;
  carbonPrice: number;
  availableArea?: number;  // NEW: Shows remaining available land
}
```

#### `/api/user/land-purchase/validate` Response

The `availableArea` field now shows the actual remaining land:

```typescript
interface ValidatePurchaseResponse {
  canPurchase: boolean;
  goldCost: number;
  carbonCost: number;
  totalCost: number;
  availableArea: number;     // Actual remaining available land
  teamGoldBalance: number;
  teamCarbonBalance: number;
  errors: string[];
}
```

### 3. Error Handling Updates

#### New Error Messages

Add these error message translations:

**English (en)**:
```json
{
  "ONLY_STUDENTS_CAN_PURCHASE_LAND": "Only students can purchase land",
  "LAND_PURCHASE_EXCEEDS_AVAILABLE": "Purchase exceeds available land. Remaining available: {{available}} units (Total limit: {{limit}} units, Already purchased by all teams: {{totalUsed}} units)",
  "STUDENT_LAND_LIMIT": "Students share a total land purchase limit of {{limit}} units on this tile across all teams"
}
```

**Chinese (zh)**:
```json
{
  "ONLY_STUDENTS_CAN_PURCHASE_LAND": "只有学生可以购买土地",
  "LAND_PURCHASE_EXCEEDS_AVAILABLE": "购买超出可用土地。剩余可用：{{available}} 单位（总限制：{{limit}} 单位，所有团队已购买：{{totalUsed}} 单位）",
  "STUDENT_LAND_LIMIT": "所有团队的学生在此地块共享 {{limit}} 单位的土地购买限制"
}
```

#### Error Response Handling

Handle new error scenarios:

```typescript
// Example error handling
try {
  await purchaseLand(tileId, area);
} catch (error) {
  if (error.code === 'ONLY_STUDENTS_CAN_PURCHASE_LAND') {
    // Show message that only students can purchase
    showError('Only students are allowed to purchase land');
  } else if (error.code === 'LAND_PURCHASE_EXCEEDS_AVAILABLE') {
    // Show remaining available land
    showError(`Only ${error.data.available} units remaining on this tile`);
  }
}
```

### 4. UI Component Updates

#### Purchase Button/Form
```typescript
// Before showing purchase UI
const userCanPurchase = user.userType === 3; // Student type

if (!userCanPurchase) {
  return <div>Only students can purchase land</div>;
}

// Show purchase form with available land info
return (
  <div>
    <p>Available to purchase: {tile.availableArea} units</p>
    <p>Total limit: {tile.availableLand} units (shared by all teams)</p>
    <PurchaseForm maxArea={tile.availableArea} />
  </div>
);
```

#### Map Tile Display
```typescript
// Show different info based on user type
const renderTileInfo = (tile: AvailableTileDto) => {
  if (user.userType === 3) { // Student
    return (
      <>
        <div>Available: {tile.availableArea} / {tile.availableLand} units</div>
        <div>Your team owns: {tile.teamOwnedArea} units</div>
        <Button disabled={tile.availableArea === 0}>Purchase</Button>
      </>
    );
  } else {
    return (
      <>
        <div>Total owned by all teams: {tile.totalOwnedArea} units</div>
        <div>Land purchase is restricted to students</div>
      </>
    );
  }
};
```

### 5. Admin Panel Updates

#### Removed Features
- Remove any UI for `availableLandMultiplier` configuration
- Only show fixed value input for `availableLand`

#### Configuration DTOs
Remove multiplier fields from admin configuration:

```typescript
// REMOVED
interface BulkUpdateTilesByLandTypeDto {
  // ... other fields ...
  availableLandMultiplier?: number; // REMOVED
  fixedAvailableLand?: number;      // Still available
}
```

## Admin Configuration for Map Templates

### Available Admin Endpoints

Admins can configure the `availableLand` values for map template tiles through the following endpoints:

#### 1. Update Individual Tile Configuration
**Endpoint**: `PATCH /api/admin/map-template/{templateId}/tiles/{tileId}`

```typescript
// Request Body
{
  "availableLand": 20  // Set available land limit for this tile
}

// Example: Set tile 5 in template 1 to have 20 available land units
PATCH /api/admin/map-template/1/tiles/5
{
  "availableLand": 20
}
```

#### 2. Bulk Update Tiles by Land Type
**Endpoint**: `PATCH /api/admin/map-template/{templateId}/tiles/by-land-type`

```typescript
// Request Body
{
  "landType": "GRASSLAND",
  "fixedAvailableLand": 15  // Set all grassland tiles to 15 units
}

// Example: Set all FOREST tiles to have 5 available land units
PATCH /api/admin/map-template/1/tiles/by-land-type
{
  "landType": "FOREST",
  "fixedAvailableLand": 5
}

// Example: Set all MARINE tiles to 0 (cannot be purchased)
PATCH /api/admin/map-template/1/tiles/by-land-type
{
  "landType": "MARINE",
  "fixedAvailableLand": 0
}
```

#### 3. Reset Tiles to Default Values
**Endpoint**: `POST /api/admin/map-template/{templateId}/tiles/reset-defaults`

This endpoint resets tiles to their default configuration, including:
- `availableLand`: 10 (default value for all non-marine tiles)
- Marine tiles: 0 (cannot be purchased)

```typescript
// No body required
POST /api/admin/map-template/1/tiles/reset-defaults
```

#### 4. Apply Template to Activity
**Endpoint**: `PATCH /api/admin/activities/{activityId}/apply-template/{templateId}`

When applying a template to an activity, all tile configurations including `availableLand` values are applied.

### Configuration Guidelines

#### Land Type Recommendations
Different land types may have different available land limits based on game balance:

```typescript
// Recommended configurations
const recommendedLimits = {
  MARINE: 0,        // Water tiles - cannot be purchased
  GRASSLAND: 10,    // Standard buildable land
  FOREST: 5,        // Limited due to environmental protection
  DESERT: 3,        // Limited due to harsh conditions
  MOUNTAIN: 2,      // Limited due to terrain difficulty
  WETLAND: 8,       // Moderate availability
  CITY: 15          // More available in urban areas
};
```

#### Validation Rules
- `availableLand` must be an integer >= 0
- Marine tiles should always be set to 0
- Changes to `availableLand` do NOT affect existing purchases
- The limit is shared across ALL teams in an activity

### Admin UI Requirements

#### Template Configuration Screen
The admin panel should display:

```typescript
interface TileConfigurationForm {
  tileId: number;
  coordinates: { q: number, r: number };
  landType: string;
  availableLand: number;  // Input field for admin to set
  currentUsage?: number;   // Display how much is already purchased (read-only)
}
```

#### Bulk Update Interface
```typescript
interface BulkUpdateForm {
  landType: LandType;           // Dropdown to select land type
  fixedAvailableLand: number;    // Input field for new value
  affectedTilesCount?: number;   // Display count of tiles that will be updated
}
```

### Example Admin Workflow

1. **Create/Edit Map Template**
   - Admin navigates to map template configuration
   - Views all tiles with their current `availableLand` values
   - Can edit individual tiles or bulk update by land type

2. **Set Strategic Limits**
   ```typescript
   // Example: Creating a resource-scarce scenario
   await updateTilesByLandType({
     landType: 'GRASSLAND',
     fixedAvailableLand: 5  // Reduced from default 10
   });

   await updateTilesByLandType({
     landType: 'CITY',
     fixedAvailableLand: 20  // Increased for urban development
   });
   ```

3. **Apply to Activity**
   - Template with configured `availableLand` values is applied to an activity
   - Students in that activity will see these limits when purchasing land

### API Response Examples

#### Get Tile Configuration Response
```typescript
{
  "tileId": 5,
  "axialQ": 2,
  "axialR": 3,
  "landType": "GRASSLAND",
  "availableLand": 10,
  "initialGoldPrice": 100,
  "initialCarbonPrice": 50,
  // ... other fields
}
```

#### Update Tile Configuration Response
```typescript
{
  "success": true,
  "message": "Tile configuration updated successfully",
  "data": {
    "tileId": 5,
    "availableLand": 20,
    "updatedFields": ["availableLand"]
  }
}
```

### Important Notes for Admin Configuration

1. **Changes Don't Affect Existing Purchases**: Modifying `availableLand` only affects future purchases
2. **Shared Across Teams**: The limit is shared by ALL teams in the activity
3. **Marine Tiles**: Always set to 0 as they cannot be purchased
4. **Default Value**: New tiles default to 10 units of available land
5. **No Multipliers**: The system no longer supports multipliers, only fixed values

## Migration Checklist

### Frontend Tasks

- [ ] Check user type before showing purchase UI
- [ ] Update error handling for new error codes
- [ ] Update available land display to show shared limits
- [ ] Remove multiplier configuration UI from admin panel
- [ ] Update API response interfaces to include `availableArea`
- [ ] Add validation to prevent non-students from accessing purchase endpoints
- [ ] Update purchase form to respect `availableArea` limits
- [ ] Add informational messages for non-student users
- [ ] Test with different user types (Manager, Worker, Student)
- [ ] Update any documentation or help text

### Testing Scenarios

1. **Student User Flow**
   - Can view available land on each tile
   - Can purchase up to available limit
   - Gets error when exceeding available land
   - Sees real-time updates as other teams purchase

2. **Non-Student User Flow**
   - Cannot access purchase functionality
   - Gets appropriate error message if attempting to purchase
   - Can still view land ownership information

3. **Available Land Validation**
   - Multiple teams purchasing same tile
   - Reaching the shared limit
   - Marine tiles showing 0 available

## Breaking Changes Summary

1. **User Type Restriction**: Only students (userType = 3) can purchase land
2. **API Changes**: New `availableArea` field in responses
3. **Validation Changes**: Shared available land limits across all teams
4. **Admin Configuration**: Removed multiplier functionality

## Rollback Plan

If rollback is needed:
1. Database migration can be reverted (availableLand field has default value)
2. Code changes would need to be reverted via git
3. Frontend would need to remove user type checks

## Questions/Support

For any questions about this migration:
- Review the implementation in the land-purchase service
- Check the API documentation at `/docs`
- Contact the backend team for clarification

## Related Files

- Backend Changes:
  - `/src/user/land-purchase.service.ts`
  - `/src/user/land-view.service.ts`
  - `/src/map/dto/map-tile-update.dto.ts`
  - `/src/common/constants/user-types.ts`

- Database:
  - Migration: `20250930073048_add_available_land_to_map_tiles`
  - Model: `/prisma/models/map.prisma`

- i18n:
  - `/src/common/i18n/translations/en/LAND.json`
  - `/src/common/i18n/translations/zh/LAND.json`