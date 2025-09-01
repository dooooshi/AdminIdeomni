# Resource Consumption Internal Service

## Overview
Resource consumption is an **internal service** that handles water/power consumption and records transaction history. It's used internally by all facility modules - NOT exposed as a public API.

## Internal Service Interface

### ResourceConsumptionService

```typescript
@Injectable()
export class ResourceConsumptionService {
  constructor(
    private prisma: PrismaService,
    private infrastructureService: InfrastructureService,
    private teamService: TeamService
  ) {}
  
  /**
   * Consume resources and record transaction history
   * Called internally by production, manufacturing, operations, etc.
   */
  async consumeResources(params: {
    facilityId: string;
    resourceRequirements: Array<{
      type: 'WATER' | 'POWER';
      quantity: number;
    }>;
    purpose: ConsumptionPurpose;
    referenceType?: string;
    referenceId?: string;
    teamId: string;
    activityId: string;
    userId: string;
  }): Promise<{
    success: boolean;
    transactions: ResourceTransaction[];
    totalCost: number;
    error?: string;
  }> {
    try {
      // 1. Validate connections exist
      const connections = await this.validateConnections(
        params.facilityId,
        params.resourceRequirements
      );
      
      // 2. Calculate costs
      const costs = this.calculateCosts(
        params.resourceRequirements,
        connections
      );
      
      // 3. Validate funds
      await this.validateFunds(params.teamId, costs.total);
      
      // 4. Process payment and record history in transaction
      const transactions = await this.processAndRecord(params, connections, costs);
      
      return {
        success: true,
        transactions,
        totalCost: costs.total
      };
    } catch (error) {
      return {
        success: false,
        transactions: [],
        totalCost: 0,
        error: error.message
      };
    }
  }
  
  /**
   * Get consumption history
   * For querying historical transactions
   */
  async getConsumptionHistory(params: {
    facilityId?: string;
    teamId?: string;
    resourceType?: ResourceType;
    purpose?: ConsumptionPurpose;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<ResourceTransaction[]> {
    return this.prisma.resourceTransaction.findMany({
      where: {
        ...(params.facilityId && { consumerFacilityId: params.facilityId }),
        ...(params.teamId && { consumerTeamId: params.teamId }),
        ...(params.resourceType && { resourceType: params.resourceType }),
        ...(params.purpose && { purpose: params.purpose }),
        ...(params.startDate && {
          transactionDate: {
            gte: params.startDate,
            ...(params.endDate && { lte: params.endDate })
          }
        })
      },
      orderBy: { transactionDate: 'desc' },
      take: params.limit || 100
    });
  }
  
  /**
   * Private: Validate infrastructure connections
   */
  private async validateConnections(
    facilityId: string,
    requirements: Array<{ type: string; quantity: number }>
  ) {
    const connections = {};
    
    for (const req of requirements) {
      const connection = await this.infrastructureService
        .getActiveConnection(facilityId, req.type);
      
      if (!connection) {
        throw new Error(`No active ${req.type} connection for facility`);
      }
      
      connections[req.type] = connection;
    }
    
    return connections;
  }
  
  /**
   * Private: Calculate costs
   */
  private calculateCosts(requirements: any[], connections: any) {
    let total = 0;
    const breakdown = {};
    
    for (const req of requirements) {
      const connection = connections[req.type];
      const cost = req.quantity * connection.unitPrice;
      breakdown[req.type] = cost;
      total += cost;
    }
    
    return { total, breakdown };
  }
  
  /**
   * Private: Validate team has sufficient funds
   */
  private async validateFunds(teamId: string, totalCost: number) {
    const team = await this.teamService.getTeam(teamId);
    if (team.balance < totalCost) {
      throw new Error(`Insufficient funds: need ${totalCost}, have ${team.balance}`);
    }
  }
  
  /**
   * Private: Process payment and record history atomically
   */
  private async processAndRecord(params: any, connections: any, costs: any) {
    return await this.prisma.$transaction(async (tx) => {
      const transactions = [];
      
      // Get raw material for carbon/gold breakdown
      const material = await tx.rawMaterial.findUnique({
        where: { id: params.rawMaterialId }
      });
      
      for (const req of params.resourceRequirements) {
        const connection = connections[req.type];
        
        // Calculate gold and carbon impact
        const goldAmount = costs.breakdown[req.type];
        const carbonAmount = material ? 
          (material.carbonEmission * params.quantity) : 0;
        
        // Create team operation history for gold expense (consumer)
        const consumerOperation = await tx.teamOperationHistory.create({
          data: {
            teamId: params.teamId,
            userId: params.userId,
            operationType: 'FACILITY_EXPENSE',
            amount: goldAmount,
            resourceType: 'GOLD',
            description: `${req.type} consumption for production`,
            metadata: {
              resourceType: req.type,
              quantity: req.quantity,
              productionId: params.referenceId
            }
          }
        });
        
        // Create team operation history for gold income (provider)
        const providerOperation = await tx.teamOperationHistory.create({
          data: {
            teamId: connection.providerTeamId,
            userId: params.userId,
            operationType: 'FACILITY_INCOME',
            amount: goldAmount,
            resourceType: 'GOLD',
            sourceTeamId: params.teamId,
            description: `${req.type} provision payment`,
            metadata: {
              resourceType: req.type,
              quantity: req.quantity,
              productionId: params.referenceId
            }
          }
        });
        
        // Create team balance history for consumer
        const consumerBalance = await tx.teamBalanceHistory.create({
          data: {
            teamId: params.teamId,
            goldChange: -goldAmount,
            carbonChange: carbonAmount,
            operationId: consumerOperation.id,
            goldBalance: 0, // Will be updated with actual balance
            carbonBalance: 0 // Will be updated with actual balance
          }
        });
        
        // Create team balance history for provider
        const providerBalance = await tx.teamBalanceHistory.create({
          data: {
            teamId: connection.providerTeamId,
            goldChange: goldAmount,
            carbonChange: 0,
            operationId: providerOperation.id,
            goldBalance: 0, // Will be updated with actual balance
            carbonBalance: 0 // Will be updated with actual balance
          }
        });
        
        // Create resource transaction with history links
        const transaction = await tx.resourceTransaction.create({
          data: {
            resourceType: req.type,
            quantity: req.quantity,
            unitPrice: connection.unitPrice,
            totalAmount: costs.breakdown[req.type],
            connectionId: connection.id,
            consumerFacilityId: params.facilityId,
            consumerTeamId: params.teamId,
            providerFacilityId: connection.providerFacilityId,
            providerTeamId: connection.providerTeamId,
            purpose: params.purpose,
            referenceType: params.referenceType,
            referenceId: params.referenceId,
            status: 'SUCCESS',
            operationHistoryId: consumerOperation.id,
            balanceHistoryId: consumerBalance.id,
            activityId: params.activityId,
            initiatedBy: params.userId,
            transactionDate: new Date()
          }
        });
        
        transactions.push(transaction);
        
        // Update team gold balances
        await tx.team.update({
          where: { id: params.teamId },
          data: { 
            goldBalance: { decrement: goldAmount },
            carbonBalance: { increment: carbonAmount }
          }
        });
        
        await tx.team.update({
          where: { id: connection.providerTeamId },
          data: { 
            goldBalance: { increment: goldAmount }
          }
        });
      }
      
      return transactions;
    });
  }
}
```

## How Other Modules Use It

### Raw Material Production

```typescript
@Injectable()
export class RawMaterialProductionService {
  constructor(
    private resourceConsumption: ResourceConsumptionService
  ) {}
  
  async startProduction(request: ProductionRequest) {
    // Calculate resource needs
    const waterNeeded = material.waterRequired * quantity;
    const powerNeeded = material.powerRequired * quantity;
    
    // Consume resources internally
    const result = await this.resourceConsumption.consumeResources({
      facilityId: request.facilityId,
      resourceRequirements: [
        { type: 'WATER', quantity: waterNeeded },
        { type: 'POWER', quantity: powerNeeded }
      ],
      purpose: 'RAW_MATERIAL_PRODUCTION',
      referenceType: 'PRODUCTION',
      referenceId: production.id,
      teamId: team.id,
      activityId: activity.id,
      userId: user.id
    });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    // Store transaction IDs for reference
    production.transactionIds = result.transactions.map(t => t.id);
    production.resourceCost = result.totalCost;
    
    // Continue with production...
  }
}
```

### Future: Factory Manufacturing

```typescript
@Injectable()
export class ManufacturingService {
  constructor(
    private resourceConsumption: ResourceConsumptionService
  ) {}
  
  async manufactureProduct(order: ManufacturingOrder) {
    // Factory uses same internal service
    const result = await this.resourceConsumption.consumeResources({
      facilityId: order.factoryId,
      resourceRequirements: [
        { type: 'WATER', quantity: 500 },
        { type: 'POWER', quantity: 1500 }
      ],
      purpose: 'PRODUCT_MANUFACTURING',
      referenceType: 'MANUFACTURING_ORDER',
      referenceId: order.id,
      // ... other params
    });
    
    // Handle result...
  }
}
```

## History API Endpoints

While resource consumption itself is internal, viewing history is exposed through domain-specific APIs:

### Production Module Exposes History
```typescript
// GET /api/facility/production/resource-history
async getProductionResourceHistory(facilityId: string) {
  return this.resourceConsumption.getConsumptionHistory({
    facilityId,
    purpose: 'RAW_MATERIAL_PRODUCTION'
  });
}
```

### Team Module Exposes History
```typescript
// GET /api/team/resource-history
async getTeamResourceHistory(teamId: string) {
  return this.resourceConsumption.getConsumptionHistory({
    teamId
  });
}
```

## Module Setup

```typescript
@Module({
  providers: [ResourceConsumptionService],
  exports: [ResourceConsumptionService] // Export for other modules to use
})
export class ResourceConsumptionModule {}

// Other modules import it
@Module({
  imports: [ResourceConsumptionModule],
  // ...
})
export class RawMaterialProductionModule {}
```

## Key Points

1. **Internal Only**: No public API endpoints
2. **History Focused**: Records transaction history
3. **Reusable**: All modules use same service
4. **Atomic**: Payment and recording in one transaction
5. **Simple**: Just consume resources and record history

This service provides a clean internal interface for resource consumption that any module can use while keeping all history in one place.