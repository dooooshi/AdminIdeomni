# Raw Material Shop Data Model

## Overview
Database schema design for the activity-based Raw Material Shop module using Prisma ORM with PostgreSQL. The shop system provides a centralized marketplace per activity where all managers collaborate to set prices and availability.

## Schema Definition

### Location
`prisma/models/raw-material-shop.prisma`

### Core Models

#### Activity Shop Entity

```prisma
// Activity Shop - One per activity (always open)
model ActivityShop {
  id                Int                      @id @default(autoincrement())
  activityId        String                   @unique // One shop per activity
  activity          Activity                 @relation(fields: [activityId], references: [id])

  // Metadata
  createdAt         DateTime                 @default(now())
  updatedAt         DateTime                 @updatedAt

  // Relations
  materials         ShopMaterial[]
  transactions      ShopTransaction[]
  priceHistory      ShopPriceHistory[]
  shopHistory       ShopHistory[]

  // Indexes
  @@index([activityId])
  @@map("activity_shops")
}

// Note: The following relations need to be added to existing models:
//
// In Activity model:
//   activityShop      ActivityShop?
//
// In User model:
//   shopTransactions  ShopTransaction[]
//   shopHistory       ShopHistory[]
//
// In Team model:
//   shopTransactions  ShopTransaction[]
//
// In FacilitySpaceInventory model:
//   shopTransactions  ShopTransaction[]
//
// In RawMaterial model:
//   shopMaterials     ShopMaterial[]

// Shop Materials - Only materials explicitly added by managers
model ShopMaterial {
  id                Int                      @id @default(autoincrement())
  shopId            Int
  shop              ActivityShop             @relation(fields: [shopId], references: [id])

  // Material Reference
  rawMaterialId     Int
  rawMaterial       RawMaterial              @relation(fields: [rawMaterialId], references: [id])

  // Pricing (Fixed price - non-negotiable but changeable by manager)
  unitPrice         Decimal                  @db.Decimal(10, 2) // Price in gold (required)

  // Stock Management (Manager sets quantity to sell)
  quantityToSell    Int?                     // Total quantity manager wants to sell (null = unlimited)
  quantitySold      Int                      @default(0) // Track how many sold

  // Metadata
  addedAt           DateTime                 @default(now()) // When material was added to shop
  addedBy           String                   // Manager who added the material
  lastPriceSetAt    DateTime?                // When price was last set/changed
  lastPriceSetBy    String?                  // Manager who last set price
  lastUpdatedAt     DateTime                 @updatedAt

  // Relations
  transactions      ShopTransaction[]
  priceHistory      ShopPriceHistory[]

  // Constraints
  @@unique([shopId, rawMaterialId]) // One entry per material per shop
  @@index([shopId])
  @@index([rawMaterialId])
  @@map("shop_materials")
}

// Transaction Records
model ShopTransaction {
  id                Int                      @id @default(autoincrement())
  transactionCode   String                   @unique @default(cuid())

  // Shop and Material
  shopId            Int
  shop              ActivityShop             @relation(fields: [shopId], references: [id])
  materialId        Int
  material          ShopMaterial             @relation(fields: [materialId], references: [id])

  // Buyer Information
  buyerId           String                   // Student user ID
  buyer             User                     @relation(fields: [buyerId], references: [id])
  buyerTeamId       String
  buyerTeam         Team                     @relation(fields: [buyerTeamId], references: [id])

  // Transaction Details
  quantity          Int                      // Amount purchased
  unitPrice         Decimal                  @db.Decimal(10, 2) // Price at time of purchase
  totalAmount       Decimal                  @db.Decimal(15, 2) // Total cost

  // Delivery Information
  facilitySpaceId   String                   // Target facility space inventory
  facilitySpace     FacilitySpaceInventory   @relation(fields: [facilitySpaceId], references: [id])
  deliveryStatus    DeliveryStatus           @default(DELIVERED) // Always instant

  // Transaction Status
  status            TransactionStatus        @default(COMPLETED)

  // Financial Integration
  accountHistoryId  Int?                     // Link to account history record

  // Timestamps
  createdAt         DateTime                 @default(now())

  // Indexes
  @@index([shopId])
  @@index([buyerId])
  @@index([buyerTeamId])
  @@index([createdAt])
  @@index([transactionCode])
  @@map("shop_transactions")
}

// Shop History - Audit trail for all shop changes
model ShopHistory {
  id                Int                      @id @default(autoincrement())
  shopId            Int
  shop              ActivityShop             @relation(fields: [shopId], references: [id])

  // Action Information
  actionType        ShopActionType           // Type of action
  actionCategory    ActionCategory           // Category of action

  // Actor Information
  actorId           String                   // User who performed action
  actor             User                     @relation(fields: [actorId], references: [id])
  actorRole         UserRole                 // Role at time of action
  actorTeamId       String?                  // Team of actor

  // Change Details
  entityType        String                   // What was changed (shop, material, price, etc.)
  entityId          Int?                     // ID of changed entity
  previousValue     Json?                    // Previous state
  newValue          Json?                    // New state
  changeDescription String                   // Human-readable description

  // Context
  ipAddress         String?
  userAgent         String?
  sessionId         String?

  // Timestamp
  createdAt         DateTime                 @default(now())

  // Indexes
  @@index([shopId])
  @@index([actorId])
  @@index([actionType])
  @@index([createdAt])
  @@map("shop_history")
}

// Price History - Track all price changes
model ShopPriceHistory {
  id                Int                      @id @default(autoincrement())
  shopId            Int
  shop              ActivityShop             @relation(fields: [shopId], references: [id])
  materialId        Int
  material          ShopMaterial             @relation(fields: [materialId], references: [id])

  // Price Change
  oldPrice          Decimal?                 @db.Decimal(10, 2) // null if first time setting
  newPrice          Decimal                  @db.Decimal(10, 2)

  // Change Context
  changedBy         String                   // Manager who changed
  managerName       String                   // Manager name for history
  changeReason      String?                  // Optional reason

  // Timestamp
  changedAt         DateTime                 @default(now())

  // Indexes
  @@index([shopId])
  @@index([materialId])
  @@index([changedAt])
  @@map("shop_price_history")
}

// Enums

enum TransactionStatus {
  PENDING            // Transaction initiated
  COMPLETED          // Successfully completed
  FAILED            // Transaction failed
  REFUNDED          // Refunded to buyer
}

enum DeliveryStatus {
  PENDING           // Not yet delivered
  DELIVERED         // Successfully delivered
  FAILED           // Delivery failed
}

enum ShopActionType {
  // Shop Management
  SHOP_CREATED

  // Material Management
  MATERIAL_ADDED             // Manager adds new material to shop
  MATERIAL_REMOVED           // Manager removes material from shop
  MATERIAL_PRICE_SET         // Setting or updating price
  MATERIAL_STOCK_UPDATED     // Stock quantity changed

  // Transactions
  PURCHASE_COMPLETED
  PURCHASE_FAILED
  PURCHASE_REFUNDED
}

enum ActionCategory {
  MATERIAL_MGMT    // Material add/remove/stock
  PRICING          // Price changes
  TRANSACTION      // Purchases
}


enum UserRole {
  MANAGER
  STUDENT
  WORKER
}
```

## Account History Integration

### Link to Financial System

```prisma
// Extension to existing AccountHistory model
model AccountHistory {
  // ... existing fields ...

  // Shop Integration
  shopTransactionId Int?                    @unique
  shopTransaction   ShopTransaction?         @relation(fields: [shopTransactionId], references: [id])

  // Transaction details stored in existing fields:
  // - amount: Transaction total
  // - type: SHOP_PURCHASE
  // - description: "Purchase: [Material Name] x[Quantity]"
  // - relatedEntityType: "SHOP_TRANSACTION"
  // - relatedEntityId: Transaction ID
}
```

## Seed Data Structure

### Location
`prisma/seed-data/activity-shop.data.ts`

### Example Seed Data

```typescript
export const activityShopSeedData = {
  // Development environment
  development: [
    {
      activityId: 1,
      materials: [] // Shop starts empty
    }
  ],

  // Production environment
  production: [
    // Shops created when activities are created
  ]
};

// Shop starts empty - managers must add materials
function initializeShop() {
  // Shop starts with no materials
  // Managers must explicitly add materials they want to sell
  return {
    materials: [] // Empty - managers will add materials
  };
}
```

## Business Rules Implementation

### Shop Management Rules

```typescript
class ShopManagementRules {

  // Manager permissions
  static canManagerModifyShop(
    userId: number,
    activityId: number
  ): boolean {
    // Any manager in the activity can modify
    return isManagerInActivity(userId, activityId);
  }

  // Price validation - managers can set any price
  static validatePrice(
    price: number
  ): ValidationResult {
    const errors: string[] = [];

    // Only constraint: price must be positive
    if (price <= 0) {
      errors.push('Price must be positive');
    }

    // No min/max constraints - managers have full control

    return { valid: errors.length === 0, errors };
  }
}
```

### Transaction Processing

```typescript
class TransactionProcessor {

  // Process purchase with account history
  async processPurchase(
    purchase: PurchaseDto
  ): Promise<TransactionResult> {

    return await this.prisma.$transaction(async (tx) => {
      // 1. Get material from shop
      const material = await tx.shopMaterial.findUnique({
        where: {
          id: purchase.materialId
        }
      });

      if (!material) {
        throw new Error('Material not found in shop');
      }

      // 2. Check stock if limited
      if (material.quantityToSell !== null) {
        const remaining = material.quantityToSell - material.quantitySold;
        if (remaining < purchase.quantity) {
          throw new Error('Insufficient stock');
        }
      }

      // 3. Validate buyer funds
      const team = await tx.team.findUnique({
        where: { id: purchase.teamId }
      });

      const totalCost = material.unitPrice * purchase.quantity;

      if (team.goldBalance < totalCost) {
        throw new Error('Insufficient funds');
      }

      // 4. Create transaction
      const transaction = await tx.shopTransaction.create({
        data: {
          shopId: material.shopId,
          materialId: material.id,
          buyerId: purchase.userId,
          buyerTeamId: purchase.teamId,
          quantity: purchase.quantity,
          unitPrice: material.unitPrice,
          totalAmount: totalCost,
          facilitySpaceId: purchase.facilitySpaceId,
          status: 'COMPLETED',
          deliveryStatus: 'DELIVERED'
        }
      });

      // 5. Update team balance
      await tx.team.update({
        where: { id: purchase.teamId },
        data: { goldBalance: { decrement: totalCost } }
      });

      // 6. Create account history entry
      await tx.accountHistory.create({
        data: {
          teamId: purchase.teamId,
          userId: purchase.userId,
          type: 'SHOP_PURCHASE',
          amount: -totalCost, // Negative for expense
          description: `Purchase: ${material.rawMaterial.nameEn} x${purchase.quantity}`,
          relatedEntityType: 'SHOP_TRANSACTION',
          relatedEntityId: transaction.id,
          shopTransactionId: transaction.id,
          createdAt: new Date()
        }
      });

      // 7. Update material stock
      await tx.shopMaterial.update({
        where: { id: material.id },
        data: {
          quantitySold: { increment: purchase.quantity }
        }
      });

      // 8. Deliver to facility space
      await this.deliverToFacility(
        purchase.facilitySpaceId,
        material.rawMaterialId,
        purchase.quantity
      );

      // 9. Log to shop history
      await tx.shopHistory.create({
        data: {
          shopId: material.shopId,
          actionType: 'PURCHASE_COMPLETED',
          actionCategory: 'TRANSACTION',
          actorId: purchase.userId,
          actorRole: 'STUDENT',
          actorTeamId: purchase.teamId,
          entityType: 'transaction',
          entityId: transaction.id,
          newValue: {
            material: material.rawMaterial.nameEn,
            quantity: purchase.quantity,
            totalAmount: totalCost,
            unitPrice: material.unitPrice
          },
          changeDescription: `Student purchased ${purchase.quantity} units of ${material.rawMaterial.nameEn} for ${totalCost} gold`
        }
      });

      return transaction;
    });
  }
}
```

## Shop History Tracking

### History Service Implementation

```typescript
@Injectable()
export class ShopHistoryService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  // Log price change (can be initial setting or update)
  async logPriceChange(
    shopId: number,
    materialId: number,
    oldPrice: number | null,
    newPrice: number,
    managerId: number,
    reason?: string
  ): Promise<void> {
    // Create price history record
    await this.prisma.shopPriceHistory.create({
      data: {
        shopId,
        materialId,
        oldPrice,
        newPrice,
        changedBy: managerId,
        managerName: await this.getManagerName(managerId),
        changeReason: reason
      }
    });

    // Log to general shop history
    const description = oldPrice
      ? `Price changed from ${oldPrice} to ${newPrice} gold`
      : `Price set to ${newPrice} gold`;

    await this.prisma.shopHistory.create({
      data: {
        shopId,
        actionType: 'MATERIAL_PRICE_SET',
        actionCategory: 'PRICING',
        actorId: managerId,
        actorRole: 'MANAGER',
        entityType: 'material',
        entityId: materialId,
        previousValue: oldPrice ? { price: oldPrice } : null,
        newValue: { price: newPrice },
        changeDescription: description
      }
    });
  }

  // Get shop activity report
  async getShopHistory(
    shopId: number,
    filters?: HistoryFilters
  ): Promise<ShopHistory[]> {
    return this.prisma.shopHistory.findMany({
      where: {
        shopId,
        ...(filters?.actionType && { actionType: filters.actionType }),
        ...(filters?.actorId && { actorId: filters.actorId }),
        ...(filters?.startDate && {
          createdAt: { gte: filters.startDate }
        }),
        ...(filters?.endDate && {
          createdAt: { lte: filters.endDate }
        })
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
```

## Database Performance Optimization

### Indexing Strategy

```sql
-- Core indexes for performance
CREATE INDEX idx_shop_materials_shop ON shop_materials(shop_id);
CREATE INDEX idx_shop_materials_material ON shop_materials(raw_material_id);
CREATE INDEX idx_shop_transactions_team ON shop_transactions(buyer_team_id, created_at DESC);
CREATE INDEX idx_shop_history_actor ON shop_history(actor_id, created_at DESC);
CREATE INDEX idx_shop_history_action ON shop_history(action_type, created_at DESC);
CREATE INDEX idx_price_history_material ON shop_price_history(material_id, changed_at DESC);
```

### Query Optimization

```sql
-- Get materials in shop
SELECT
  sm.id,
  sm.unit_price,
  sm.quantity_to_sell,
  sm.quantity_sold,
  rm.name_en,
  rm.name_zh,
  rm.origin
FROM shop_materials sm
JOIN raw_materials rm ON sm.raw_material_id = rm.id
WHERE sm.shop_id = ?
ORDER BY rm.name_en;

-- Get transaction summary for team
SELECT
  DATE(created_at) as purchase_date,
  COUNT(*) as transaction_count,
  SUM(total_amount) as daily_spend
FROM shop_transactions
WHERE buyer_team_id = ?
  AND created_at >= ?
GROUP BY DATE(created_at)
ORDER BY purchase_date DESC;
```

## Integration Points

### Activity System Integration
- Shop creation triggered by activity creation
- Shop deactivation on activity end
- Manager permissions scoped to activity

### Team System Integration
- Team gold balance for purchases
- Team ownership validation for facility delivery

### Facility System Integration
- Direct delivery to facility spaces
- Facility ownership validation
- Material compatibility checks (optional)

### Account History Integration
- Automatic account history entries for purchases
- Financial tracking and reporting
- Budget analysis support

This data model provides a comprehensive foundation for the activity-based Raw Material Shop with complete history tracking and account integration.