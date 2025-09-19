# MTO Type 1 Integration Guide

## Overview

This document details how MTO Type 1 integrates with existing platform systems and provides implementation guidance for developers. MTO Type 1 has been designed with comprehensive integration to three critical platform systems: **Transportation**, **Manager Product Formula**, and **Population**, along with other essential platform components.

## Critical System Integrations

### ✅ Transportation System
- Leverages instant transfer model for product deliveries
- Uses dual distance system (hex distance for tier, transport units for cost)
- Integrates space-based pricing model for delivery fees
- See: [Transportation Documentation](/docs/transportation/README.md)

### ✅ Manager Product Formula
- Direct dependency via `managerProductFormulaId`
- Formula validation for all product deliveries
- Automatic formula locking when MTO is released
- See: [Manager Product Formula Documentation](/docs/mto/manager-product-formula/README.md)

### ✅ Population System
- Core mechanism for demand calculation based on tile population
- Uses ActivityTileState.currentPopulation for real-time data
- Automatic demand distribution based on population density
- See: [Population Documentation](/docs/population/README.md)

For detailed integration analysis, see: [System Integration Analysis](./system-integration-analysis.md)

## 1. System Integration Points

### 1.1 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         MTO Type 1                           │
├─────────────────────────────────────────────────────────────┤
│                     Core Components                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Demand   │ │ Delivery │ │Settlement│ │ Return   │      │
│  │Calculator│ │ Manager  │ │Processor │ │ Handler  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Integration Layer                         │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Product  │ │  Team    │ │   Map    │ │ Facility │       │
│ │ Formula  │ │ Account  │ │  System  │ │Management│       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │Transport │ │  Auth    │ │   i18n   │ │ Logging  │       │
│ │  System  │ │  System  │ │  System  │ │  System  │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 2. Product Formula Integration

### 2.1 Formula Service Integration

```typescript
// src/mto-type1/services/formula-integration.service.ts

import { Injectable } from '@nestjs/common';
import { ManagerProductFormulaService } from '@/manager-product-formula/services';

@Injectable()
export class MtoType1FormulaIntegrationService {
  constructor(
    private readonly formulaService: ManagerProductFormulaService
  ) {}

  async validateProductAgainstFormula(
    inventoryItemId: string,
    formulaId: number
  ): Promise<boolean> {
    const formula = await this.formulaService.findById(formulaId);
    const inventoryItem = await this.getInventoryItemDetails(inventoryItemId);

    return this.validateComponents(inventoryItem, formula.materials);
  }

  private validateComponents(
    product: Product,
    requiredComponents: any
  ): boolean {
    // Component validation logic
    return requiredComponents.every(component =>
      this.productHasComponent(product, component)
    );
  }
}
```

### 2.2 Formula Validation Rules

```typescript
interface FormulaValidation {
  checkComponentTypes(product: Product, formula: Formula): boolean;
  checkQualityStandards(product: Product, formula: Formula): boolean;
  checkPackagingRequirements(product: Product, formula: Formula): boolean;
  checkQuantityConstraints(quantity: number, formula: Formula): boolean;
}
```

## 3. Team Account Integration

### 3.1 Payment Processing

```typescript
// src/mto-type1/services/payment-integration.service.ts

import { Injectable } from '@nestjs/common';
import { TeamAccountService } from '@/team-account/services';
import { TransactionType } from '@/team-account/enums';

@Injectable()
export class MtoType1PaymentService {
  constructor(
    private readonly teamAccountService: TeamAccountService
  ) {}

  async processSettlementPayment(
    teamId: string,
    amount: number,
    mtoType1Id: string,
    deliveryId: string
  ): Promise<TransactionResult> {
    return await this.teamAccountService.credit({
      teamId,
      amount,
      type: TransactionType.MTO_TYPE1_SETTLEMENT,
      reference: `MTO1-${mtoType1Id}-${deliveryId}`,
      description: 'MTO Type 1 product delivery settlement',
      metadata: {
        mtoType1Id,
        deliveryId,
        timestamp: new Date()
      }
    });
  }

  async chargeTransportationFee(
    teamId: string,
    amount: number,
    deliveryId: string
  ): Promise<TransactionResult> {
    return await this.teamAccountService.debit({
      teamId,
      amount,
      type: TransactionType.TRANSPORTATION_FEE,
      reference: `TRANS-${deliveryId}`,
      description: 'MTO Type 1 delivery transportation fee',
      metadata: {
        deliveryId,
        chargeType: 'delivery'
      }
    });
  }
}
```

### 3.2 Balance Verification

```typescript
async verifyTeamBalance(
  teamId: string,
  requiredAmount: number
): Promise<boolean> {
  const balance = await this.teamAccountService.getBalance(teamId);
  return balance >= requiredAmount;
}
```

## 4. Map System Integration

### 4.1 Tile Population Service

```typescript
// src/mto-type1/services/tile-integration.service.ts

import { Injectable } from '@nestjs/common';
import { MapService } from '@/map/services';
import { TileService } from '@/map/services/tile.service';

@Injectable()
export class MtoType1TileIntegrationService {
  constructor(
    private readonly mapService: MapService,
    private readonly tileService: TileService
  ) {}

  async getTilesWithPopulation(activityId: string): Promise<TilePopulationData[]> {
    const activityTileStates = await this.tileService.getActivityTileStates(activityId);

    return activityTileStates
      .filter(state => state.currentPopulation > 0)
      .map(state => ({
        mapTileId: state.tileId,
        activityTileStateId: state.id,
        population: state.currentPopulation,
        coordinates: {
          q: state.tile.axialQ,
          r: state.tile.axialR
        },
        populationMultiplier: state.populationMultiplier
      }));
  }

  async calculateDistance(
    fromMapTileId: number,
    toMapTileId: number
  ): Promise<number> {
    const fromTile = await this.tileService.findById(fromMapTileId);
    const toTile = await this.tileService.findById(toMapTileId);

    // Hexagonal distance calculation
    return this.hexDistance(
      { q: fromTile.axialQ, r: fromTile.axialR },
      { q: toTile.axialQ, r: toTile.axialR }
    );
  }

  private hexDistance(from: HexCoordinates, to: HexCoordinates): number {
    // Hexagonal grid distance algorithm (axial coordinates)
    const dq = to.q - from.q;
    const dr = to.r - from.r;

    if (Math.sign(dq) === Math.sign(dr)) {
      return Math.abs(dq + dr);
    }

    return Math.max(Math.abs(dq), Math.abs(dr));
  }
}
```

### 4.2 Population Updates

```typescript
interface PopulationUpdateHandler {
  onPopulationChange(tileId: string, newPopulation: number): void;
  recalculateRequirements(mtoType1Id: string): Promise<void>;
  adjustTileRequirement(tileId: string, mtoType1Id: string): Promise<void>;
}
```

## 5. Facility Management Integration

### 5.1 Product Inventory

**Important**: Students use existing Facility Space APIs to view inventory:
- `GET /api/user/facility-space/team/overview` - Get all team facilities
- `GET /api/user/facility-space/facilities/:facilityInstanceId` - Get facility details
- `GET /api/transportation/facilities/:inventoryId/items` - Get inventory items with product formula IDs

```typescript
// src/mto-type1/services/facility-integration.service.ts

import { Injectable } from '@nestjs/common';
import { FacilityService } from '@/facility/services';
import { InventoryService } from '@/facility/services/inventory.service';

@Injectable()
export class MtoType1FacilityIntegrationService {
  constructor(
    private readonly facilityService: FacilityService,
    private readonly inventoryService: InventoryService
  ) {}

  async verifyProductOwnership(
    teamId: string,
    productIds: string[],
    facilityId: string
  ): Promise<boolean> {
    const facility = await this.facilityService.findById(facilityId);

    if (facility.teamId !== teamId) {
      return false;
    }

    const inventory = await this.inventoryService.getFacilityInventory(facilityId);
    return productIds.every(productId =>
      inventory.some(item => item.productId === productId)
    );
  }

  async transferProductsForDelivery(
    productIds: string[],
    fromFacilityId: string,
    deliveryId: string
  ): Promise<void> {
    await this.inventoryService.transferToDelivery({
      productIds,
      fromFacilityId,
      deliveryReference: `MTO1-DELIVERY-${deliveryId}`,
      transferType: 'MTO_TYPE1_DELIVERY'
    });
  }

  async returnProductsToFacility(
    productIds: string[],
    toFacilityId: string,
    deliveryId: string
  ): Promise<void> {
    const facility = await this.facilityService.findById(toFacilityId);

    if (!this.hasAvailableSpace(facility, productIds.length)) {
      throw new Error('Insufficient facility space');
    }

    await this.inventoryService.receiveProducts({
      productIds,
      toFacilityId,
      receiptReference: `MTO1-RETURN-${deliveryId}`,
      receiptType: 'MTO_TYPE1_RETURN'
    });
  }

  private hasAvailableSpace(facility: Facility, productCount: number): boolean {
    return facility.availableSpace >= productCount;
  }
}
```

### 5.2 Space Management

```typescript
interface FacilitySpaceManagement {
  checkAvailableSpace(facilityId: string, requiredSpace: number): Promise<boolean>;
  reserveSpace(facilityId: string, space: number): Promise<void>;
  releaseSpace(facilityId: string, space: number): Promise<void>;
}
```

## 6. Transportation System Integration

### 6.1 Cost Calculation

```typescript
// src/mto-type1/services/transportation-integration.service.ts

import { Injectable } from '@nestjs/common';
import { TransportationService } from '@/transportation/services';
import { TransportationType } from '@/transportation/enums';

@Injectable()
export class MtoType1TransportationService {
  constructor(
    private readonly transportationService: TransportationService
  ) {}

  async calculateDeliveryCost(
    fromFacilityId: string,
    toTileId: string,
    productCount: number
  ): Promise<number> {
    const facility = await this.getFacilityLocation(fromFacilityId);
    const distance = await this.calculateDistance(facility.tileId, toTileId);

    return await this.transportationService.calculateCost({
      distance,
      quantity: productCount,
      type: TransportationType.STANDARD,
      urgency: 'NORMAL',
      cargoType: 'PRODUCTS'
    });
  }

  async getTransportationOptions(
    fromFacilityId: string,
    toTileId: string
  ): Promise<TransportOption[]> {
    return await this.transportationService.getAvailableOptions({
      origin: fromFacilityId,
      destination: toTileId,
      serviceType: 'MTO_DELIVERY'
    });
  }
}
```

### 6.2 Delivery Tracking

```typescript
interface DeliveryTracking {
  trackDeliveryStatus(deliveryId: string): Promise<DeliveryStatus>;
  estimateDeliveryTime(distance: number, method: string): number;
  confirmDelivery(deliveryId: string): Promise<void>;
}
```

## 7. Authentication & Authorization Integration

### 7.1 Guard Implementation

```typescript
// src/mto-type1/guards/mto-type1.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ManagerGuard } from '@/user/guards/user-auth.guard';

@Injectable()
export class MtoType1ManagerGuard extends ManagerGuard {
  constructor(reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check if user is a manager (userType = 1)
    const baseResult = await super.canActivate(context);
    if (!baseResult) return false;

    const request = context.switchToHttp().getRequest();
    const requiredPermission = this.reflector.get<string>(
      'mto-permission',
      context.getHandler()
    );

    if (!requiredPermission) return true;

    // Additional permission checks if needed
    // Manager role already has all MTO permissions
    return true;
  }
}
```

### 7.2 Permission Decorators

```typescript
// src/mto-type1/decorators/permissions.decorator.ts

export const RequireMtoPermission = (permission: string) =>
  SetMetadata('mto-permission', permission);

export const MTO_PERMISSIONS = {
  VIEW: 'MTO_VIEW',
  MANAGE: 'MTO_MANAGE',
  SETTLE: 'MTO_SETTLE',
  REPORT: 'MTO_REPORT'
};
```

## 8. Internationalization Integration

### 8.1 Translation Keys

```json
// src/common/i18n/translations/en/mto-type1.json
{
  "mto_type1": {
    "requirement_created": "MTO Type 1 requirement created successfully",
    "delivery_submitted": "Delivery submitted successfully",
    "settlement_completed": "Settlement completed for {{count}} products",
    "insufficient_balance": "Insufficient balance for transportation fee",
    "formula_mismatch": "Products do not match required formula",
    "delivery_window_closed": "Delivery window has closed",
    "return_requested": "Return request submitted successfully"
  }
}
```

### 8.2 i18n Service Usage

```typescript
// src/mto-type1/services/mto-type1.service.ts

import { I18nService } from '@/common/i18n/i18n.service';

@Injectable()
export class MtoType1Service {
  constructor(private readonly i18n: I18nService) {}

  async createRequirement(dto: CreateMtoType1Dto): Promise<any> {
    // ... business logic

    return {
      message: this.i18n.translate('mto_type1.requirement_created'),
      data: requirement
    };
  }
}
```

## 9. Logging & Monitoring Integration

### 9.1 Audit Logging

```typescript
// src/mto-type1/interceptors/audit.interceptor.ts

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { LoggingService } from '@/common/logging/logging.service';

@Injectable()
export class MtoType1AuditInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const action = context.getHandler().name;

    this.logger.audit({
      module: 'MTO_TYPE1',
      action,
      userId: user?.id,
      data: request.body,
      timestamp: new Date()
    });

    return next.handle();
  }
}
```

### 9.2 Performance Monitoring

```typescript
interface PerformanceMetrics {
  measureSettlementTime(mtoType1Id: string): Promise<number>;
  trackDeliveryRate(timeWindow: number): Promise<number>;
  monitorSystemLoad(): Promise<SystemLoadMetrics>;
}
```

## 10. Event System Integration

### 10.1 Event Emitters

```typescript
// src/mto-type1/events/mto-type1.events.ts

import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MtoType1EventService {
  constructor(private eventEmitter: EventEmitter2) {}

  emitRequirementReleased(requirementId: string): void {
    this.eventEmitter.emit('mto_type1.requirement.released', {
      requirementId,
      timestamp: new Date()
    });
  }

  emitSettlementCompleted(settlementData: SettlementSummary): void {
    this.eventEmitter.emit('mto_type1.settlement.completed', settlementData);
  }

  emitDeliverySubmitted(delivery: Delivery): void {
    this.eventEmitter.emit('mto_type1.delivery.submitted', delivery);
  }
}
```

### 10.2 Event Listeners

```typescript
// src/mto-type1/listeners/event.listener.ts

import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MtoType1EventListener {
  @OnEvent('mto_type1.requirement.released')
  async handleRequirementReleased(payload: any) {
    // Log event for audit trail
    await this.logEvent('requirement.released', payload);
  }

  @OnEvent('mto_type1.settlement.completed')
  async handleSettlementCompleted(payload: any) {
    // Generate settlement report
    await this.generateReport(payload);
    // Update statistics
    await this.updateStatistics(payload);
  }
}
```

## 11. Scheduled Tasks Integration

### 11.1 Cron Jobs

```typescript
// src/mto-type1/schedulers/mto-type1.scheduler.ts

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MtoType1Scheduler {
  constructor(
    private readonly mtoType1Service: MtoType1Service
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkReleaseTimes() {
    await this.mtoType1Service.processScheduledReleases();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkSettlementTimes() {
    await this.mtoType1Service.processScheduledSettlements();
  }
}
```

## 12. Module Configuration

### 12.1 Module Definition

```typescript
// src/mto-type1/mto-type1.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ManagerRequirementProductType1,
      MtoType1TileRequirement,
      MtoType1Delivery,
      MtoType1Settlement
    ]),
    ManagerProductFormulaModule,
    TeamAccountModule,
    MapModule,
    FacilityModule,
    TransportationModule,
    CommonModule
  ],
  controllers: [
    ManagerMtoType1Controller,
    TeamMtoType1Controller
  ],
  providers: [
    MtoType1Service,
    DemandCalculationService,
    SettlementService,
    DeliveryService,
    MtoType1FormulaIntegrationService,
    MtoType1PaymentService,
    MtoType1TileIntegrationService,
    MtoType1FacilityIntegrationService,
    MtoType1TransportationService,
    MtoType1EventService,
    MtoType1Scheduler
  ],
  exports: [MtoType1Service]
})
export class MtoType1Module {}
```

### 12.2 Environment Configuration

```typescript
// Configuration keys needed in .env

MTO_TYPE1_ENABLED=true
MTO_TYPE1_MAX_TILES=10000
MTO_TYPE1_MAX_DELIVERIES_PER_SETTLEMENT=100000
MTO_TYPE1_SETTLEMENT_TIMEOUT=300000  # 5 minutes in ms
MTO_TYPE1_MIN_DELIVERY_WINDOW_HOURS=24
MTO_TYPE1_CACHE_TTL=900  # 15 minutes in seconds
```

## 13. Testing Integration

### 13.1 Integration Test Setup

```typescript
// test/integration/mto-type1.test.ts

describe('MTO Type 1 Integration', () => {
  let app: INestApplication;
  let mtoType1Service: MtoType1Service;
  let teamAccountService: TeamAccountService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    mtoType1Service = app.get(MtoType1Service);
    teamAccountService = app.get(TeamAccountService);
  });

  describe('End-to-end workflow', () => {
    it('should handle complete MTO Type 1 lifecycle', async () => {
      // Create requirement
      const requirement = await createTestRequirement();

      // Trigger release
      await triggerRelease(requirement.id);

      // Submit deliveries
      const deliveries = await submitTestDeliveries(requirement.id);

      // Process settlement
      const settlement = await processSettlement(requirement.id);

      // Verify payments
      await verifyPayments(settlement);
    });
  });
});
```

## 14. Deployment Considerations

### 14.1 Database Migrations

```bash
# Generate migration for MTO Type 1
pnpm run prisma:migrate --name add_mto_type1

# Deploy to production
pnpm run prisma:migrate:deploy
```

### 14.2 Service Dependencies

Ensure these services are running:
- PostgreSQL (database)
- Redis (caching and queues)
- RabbitMQ (event messaging)
- Elasticsearch (logging and search)

### 14.3 Performance Tuning

```typescript
// Recommended indexes for production
CREATE INDEX idx_mto_type1_release_time ON manager_requirement_product_type_1(release_time);
CREATE INDEX idx_mto_type1_settlement_time ON manager_requirement_product_type_1(settlement_time);
CREATE INDEX idx_tile_requirement_mto ON mto_type_1_tile_requirement(mto_type1_id, tile_id);
CREATE INDEX idx_delivery_team ON mto_type_1_delivery(team_id, settlement_status);
```

## 15. Monitoring & Alerting

### 15.1 Key Metrics to Monitor

- Settlement processing time
- Fulfillment rates
- Failed deliveries count
- Payment processing errors
- System resource usage during settlement

### 15.2 Alert Thresholds

```yaml
alerts:
  - name: settlement_timeout
    condition: settlement_time > 300s
    severity: critical

  - name: low_fulfillment
    condition: fulfillment_rate < 50%
    severity: warning

  - name: payment_failures
    condition: payment_error_rate > 5%
    severity: critical
```