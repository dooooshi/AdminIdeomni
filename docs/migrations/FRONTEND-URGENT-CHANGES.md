# 🚨 URGENT: Frontend Changes Required - Land Purchase System

**Deployment Date**: September 30, 2024
**Priority**: HIGH
**Breaking Change**: YES

## Critical Changes - Must Fix Before Deployment

### 1. ❌ Only Students Can Purchase Land Now

```typescript
// OLD - Anyone could purchase
const canPurchase = true;

// NEW - Only students (userType = 3)
const canPurchase = user.userType === 3;
```

**Action Required:**
- Hide/disable purchase buttons for non-students
- Add user type check before any purchase API calls

### 2. ⚠️ New Available Land Limit

Each tile now has a **shared limit** across ALL teams:

```typescript
interface TileInfo {
  availableLand: number;     // Total limit (e.g., 10)
  totalOwnedArea: number;     // Already purchased by ALL teams
  availableArea: number;      // Remaining available (availableLand - totalOwnedArea)
}
```

**Action Required:**
- Show remaining available land to students
- Prevent purchases exceeding `availableArea`
- Update real-time as other teams purchase

### 3. 🔴 New Error Codes

Add these to your error handler immediately:

```typescript
switch (error.code) {
  case 'ONLY_STUDENTS_CAN_PURCHASE_LAND':
    // User is not a student
    showError('Only students can purchase land');
    break;

  case 'LAND_PURCHASE_EXCEEDS_AVAILABLE':
    // Not enough available land
    showError(`Only ${error.data.available} units remaining`);
    break;
}
```

### 4. 📝 API Response Changes

The `/api/user/land-purchase/available-tiles` response now includes:

```typescript
{
  // ... existing fields ...
  availableArea: number,  // NEW: Actual remaining land that can be purchased
}
```

**This replaces the old hardcoded 999999 value!**

## Quick Fix Guide

### Step 1: Update Purchase Button
```typescript
// In your purchase component
const PurchaseButton = ({ user, tile }) => {
  // Check if user is student
  if (user.userType !== 3) {
    return <Text>Only students can purchase land</Text>;
  }

  // Check if land is available
  if (tile.availableArea === 0) {
    return <Text>No land available (limit reached)</Text>;
  }

  return <Button onClick={handlePurchase}>Purchase Land</Button>;
};
```

### Step 2: Update Purchase Form
```typescript
// Limit input to available area
<Input
  type="number"
  max={tile.availableArea}  // Use actual available, not 999999
  placeholder={`Max: ${tile.availableArea} units`}
/>
```

### Step 3: Update Display Text
```typescript
// Show shared limit info
<div>
  <p>Available to purchase: {tile.availableArea} units</p>
  <p>Total limit for all teams: {tile.availableLand} units</p>
  <p>Already purchased by all teams: {tile.totalOwnedArea} units</p>
</div>
```

## Test These Scenarios

1. ✅ Login as **Student** → Should see purchase options
2. ❌ Login as **Manager/Worker** → Should NOT see purchase options
3. ✅ Try to purchase more than `availableArea` → Should get error
4. ✅ Marine tiles → Should show 0 available

## Admin Configuration

Admins can now configure the `availableLand` limits for each tile in map templates:

### Quick Admin API Reference
```typescript
// Update single tile
PATCH /api/admin/map-template/{templateId}/tiles/{tileId}
{ "availableLand": 20 }

// Bulk update by land type
PATCH /api/admin/map-template/{templateId}/tiles/by-land-type
{ "landType": "FOREST", "fixedAvailableLand": 5 }

// Reset to defaults (10 for most tiles, 0 for marine)
POST /api/admin/map-template/{templateId}/tiles/reset-defaults
```

**Admin UI needs to:**
- Show input field for `availableLand` (integer only)
- Remove any `availableLandMultiplier` UI (no longer supported)
- Display current usage vs. limit for each tile

## Contact

**Questions?** Check the full documentation at:
`/docs/migrations/2024-09-land-purchase-student-only.md`

---

**⏰ These changes are live in the backend. Frontend must update ASAP!**