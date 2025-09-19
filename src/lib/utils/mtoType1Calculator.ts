import {
  MtoType1Requirement,
  MtoType1TileRequirement,
  MtoType1CalculationHistory,
  MtoType1SettlementHistory,
  MtoType1Delivery,
  MtoType1Settlement
} from '@/lib/types/mtoType1';

// Extended internal interface with additional properties needed for calculations
interface MtoType1TileRequirementInternal extends MtoType1TileRequirement {
  tileName?: string;
  purchaseGoldPrice?: number;
  basePurchaseNumber?: number;
  baseCountPopulationNumber?: number;
  initialRequirement?: number;
  requirementBudget?: number;
  deliveredNumber?: number;
  remainingRequirement?: number;
  adjustmentReason?: string;
}

// Extended internal interface for delivery
interface MtoType1DeliveryInternal extends MtoType1Delivery {
  mapTileId?: string;
  deliveryNumber?: number;
  mtoType1Id?: number;
  mtoType1DeliveryId?: number;
}

export interface TilePopulationData {
  tileId: string;
  tileName: string;
  currentPopulation: number;
}

export interface MtoCalculationConfig {
  managerProductFormulaId: number;
  purchaseGoldPrice: number;
  basePurchaseNumber: number;
  overallPurchaseNumber: number;
  baseCountPopulationNumber: number;
}

export interface CalculationStep {
  stepNumber: number;
  stepType: 'INITIAL_CALCULATION' | 'BUDGET_CONSTRAINT_CHECK' | 'TILE_ELIMINATION' | 'FINAL_DISTRIBUTION';
  stepDescription: string;
  totalInitialRequirement: number;
  totalAdjustedRequirement: number;
  tilesSetToZero: number;
  tileAdjustments?: TileAdjustment[];
  budgetSaved?: number;
}

export interface TileAdjustment {
  tileId: string;
  tileName: string;
  population: number;
  initialReq: number;
  adjustedReq: number;
  reason: string;
}

export interface SettlementStep {
  stepNumber: number;
  stepType: 'TILE_PROCESSING_START' | 'DELIVERY_VALIDATION' | 'PRODUCT_VALIDATION' | 'PAYMENT_PROCESSING' | 'TILE_PROCESSING_COMPLETE';
  stepDescription: string;
  tileId?: string;
  tileName?: string;
  tileRequirement?: number;
  deliveriesProcessed?: number;
  productsValidated?: number;
  productsSettled?: number;
  productsRejected?: number;
  totalPaymentAmount?: number;
  processingDuration?: number;
  validationDetails?: any[];
}

export interface ProductFormulaValidation {
  productId: string;
  valid: boolean;
  reason?: string;
  details?: any;
}

export class MtoType1Calculator {
  private calculationHistory: CalculationStep[] = [];
  private settlementHistory: SettlementStep[] = [];

  calculateInitialRequirements(
    tiles: TilePopulationData[],
    config: MtoCalculationConfig
  ): Map<string, MtoType1TileRequirementInternal> {
    const tileRequirements = new Map<string, MtoType1TileRequirementInternal>();
    this.calculationHistory = [];
    let stepNumber = 1;

    const initialRequirements = tiles.map(tile => {
      const populationMultiplier = Math.floor(
        tile.currentPopulation / config.baseCountPopulationNumber
      );
      const initialRequirement = config.basePurchaseNumber * populationMultiplier;

      const requirement: MtoType1TileRequirementInternal = {
        id: Date.now(),
        requirementId: 0,
        tileId: tile.tileId,
        tileName: tile.tileName,
        tilePopulation: tile.currentPopulation,
        purchaseGoldPrice: config.purchaseGoldPrice,
        basePurchaseNumber: config.basePurchaseNumber,
        baseCountPopulationNumber: config.baseCountPopulationNumber,
        initialRequirement,
        calculatedRequirement: initialRequirement,
        adjustedRequirement: initialRequirement,
        deliveredQuantity: 0,
        remainingQuantity: initialRequirement,
        deliveredNumber: 0,
        remainingRequirement: initialRequirement,
        requirementBudget: initialRequirement * config.purchaseGoldPrice,
        isExcluded: false,
        adjustmentReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      tileRequirements.set(tile.tileId, requirement);
      return requirement;
    });

    const totalInitial = initialRequirements.reduce((sum, r) => sum + r.calculatedRequirement, 0);

    this.calculationHistory.push({
      stepNumber: stepNumber++,
      stepType: 'INITIAL_CALCULATION',
      stepDescription: 'Initial requirement calculation based on tile populations',
      totalInitialRequirement: totalInitial,
      totalAdjustedRequirement: totalInitial,
      tilesSetToZero: 0,
      tileAdjustments: initialRequirements.map(r => ({
        tileId: r.tileId,
        tileName: r.tileName,
        population: r.tilePopulation,
        initialReq: r.calculatedRequirement,
        adjustedReq: r.calculatedRequirement,
        reason: 'Initial calculation'
      }))
    });

    if (totalInitial > config.overallPurchaseNumber) {
      this.calculationHistory.push({
        stepNumber: stepNumber++,
        stepType: 'BUDGET_CONSTRAINT_CHECK',
        stepDescription: `Total requirement (${totalInitial}) exceeds overall limit (${config.overallPurchaseNumber})`,
        totalInitialRequirement: totalInitial,
        totalAdjustedRequirement: totalInitial,
        tilesSetToZero: 0
      });

      this.applyBudgetConstraint(
        Array.from(tileRequirements.values()),
        config,
        stepNumber
      );
    }

    const totalAdjusted = Array.from(tileRequirements.values())
      .reduce((sum, r) => sum + r.adjustedRequirement, 0);

    this.calculationHistory.push({
      stepNumber: this.calculationHistory.length + 1,
      stepType: 'FINAL_DISTRIBUTION',
      stepDescription: 'Final distribution calculation complete',
      totalInitialRequirement: totalInitial,
      totalAdjustedRequirement: totalAdjusted,
      tilesSetToZero: Array.from(tileRequirements.values()).filter(r => r.adjustedRequirement === 0).length,
      tileAdjustments: Array.from(tileRequirements.values()).map(r => ({
        tileId: r.tileId,
        tileName: r.tileName,
        population: r.tilePopulation,
        initialReq: r.calculatedRequirement,
        adjustedReq: r.adjustedRequirement,
        reason: r.excludedReason || 'Within budget'
      }))
    });

    return tileRequirements;
  }

  private applyBudgetConstraint(
    requirements: MtoType1TileRequirementInternal[],
    config: MtoCalculationConfig,
    stepNumber: number
  ): void {
    let totalRequirement = requirements.reduce((sum, r) => sum + r.adjustedRequirement, 0);

    while (totalRequirement > config.overallPurchaseNumber) {
      const beforeTotal = totalRequirement;

      const maxRequirement = Math.max(...requirements.map(r => r.adjustedRequirement));
      const maxTiles = requirements.filter(r => r.adjustedRequirement === maxRequirement);

      const eliminatedTiles: TileAdjustment[] = [];

      maxTiles.forEach(tile => {
        if (tile.adjustedRequirement > 0) {
          tile.adjustedRequirement = 0;
          tile.remainingQuantity = 0;
          tile.remainingRequirement = 0;
          tile.requirementBudget = 0;
          tile.isExcluded = true;
          tile.excludedReason = 'Budget constraint - exceeded overall limit';
          tile.adjustmentReason = 'Budget constraint - exceeded overall limit';

          eliminatedTiles.push({
            tileId: tile.tileId,
            tileName: tile.tileName,
            population: tile.tilePopulation,
            initialReq: tile.calculatedRequirement,
            adjustedReq: 0,
            reason: `Eliminated: had max requirement of ${maxRequirement}`
          });
        }
      });

      totalRequirement = requirements.reduce((sum, r) => sum + r.adjustedRequirement, 0);

      if (eliminatedTiles.length > 0) {
        this.calculationHistory.push({
          stepNumber: stepNumber++,
          stepType: 'TILE_ELIMINATION',
          stepDescription: `Eliminated ${eliminatedTiles.length} tile(s) with max requirement ${maxRequirement}`,
          totalInitialRequirement: beforeTotal,
          totalAdjustedRequirement: totalRequirement,
          tilesSetToZero: eliminatedTiles.length,
          tileAdjustments: eliminatedTiles,
          budgetSaved: (beforeTotal - totalRequirement) * config.purchaseGoldPrice
        });
      }
    }

    requirements.forEach(r => {
      if (r.adjustedRequirement > 0) {
        r.requirementBudget = r.adjustedRequirement * config.purchaseGoldPrice;
      }
    });
  }

  simulateSettlement(
    tileRequirements: Map<string, MtoType1TileRequirementInternal>,
    deliveries: MtoType1Delivery[],
    config: MtoCalculationConfig
  ): Map<string, MtoType1Settlement[]> {
    const settlementsByTile = new Map<string, MtoType1Settlement[]>();
    this.settlementHistory = [];
    let globalStepNumber = 1;

    Array.from(tileRequirements.entries()).forEach(([tileId, requirement]) => {
      const tileDeliveries = deliveries
        .filter(d => d.tileId === tileId)
        .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

      this.settlementHistory.push({
        stepNumber: globalStepNumber++,
        stepType: 'TILE_PROCESSING_START',
        stepDescription: `Starting settlement for tile ${requirement.tileName}`,
        tileId: requirement.tileId,
        tileName: requirement.tileName,
        tileRequirement: requirement.adjustedRequirement
      });

      const settlements: MtoType1Settlement[] = [];
      let remainingRequirement = requirement.adjustedRequirement;
      let totalValidated = 0;
      let totalRejected = 0;

      this.settlementHistory.push({
        stepNumber: globalStepNumber++,
        stepType: 'DELIVERY_VALIDATION',
        stepDescription: `Processing ${tileDeliveries.length} deliveries for tile`,
        tileId: requirement.tileId,
        deliveriesProcessed: tileDeliveries.length
      });

      tileDeliveries.forEach(delivery => {
        let validatedCount = 0;
        let rejectedCount = 0;

        const deliveryQuantity = (delivery as MtoType1DeliveryInternal).deliveryNumber || delivery.productQuantity || 0;
        for (let i = 0; i < deliveryQuantity; i++) {
          if (remainingRequirement <= 0) {
            rejectedCount++;
          } else {
            const isValid = this.validateProductAgainstFormula(
              `product-${i}`,
              config.managerProductFormulaId
            );

            if (isValid) {
              validatedCount++;
              remainingRequirement--;

              settlements.push({
                id: Date.now() + i,
                requirementId: delivery.requirementId,
                deliveryId: delivery.id,
                teamId: delivery.teamId,
                tileId: delivery.tileId,
                settledQuantity: 1,
                unitPrice: (requirement as any).purchaseGoldPrice || config.purchaseGoldPrice,
                totalPayment: (requirement as any).purchaseGoldPrice || config.purchaseGoldPrice,
                transactionId: `payment-${Date.now()}-${i}`,
                settledAt: new Date().toISOString()
              } as MtoType1Settlement);
            } else {
              rejectedCount++;
            }
          }
        }

        totalValidated += validatedCount;
        totalRejected += rejectedCount;

        this.settlementHistory.push({
          stepNumber: globalStepNumber++,
          stepType: 'PRODUCT_VALIDATION',
          stepDescription: `Validated products for delivery ${delivery.id}`,
          tileId: requirement.tileId,
          productsValidated: validatedCount + rejectedCount,
          productsSettled: validatedCount,
          productsRejected: rejectedCount
        });

        if (validatedCount > 0) {
          const paymentAmount = validatedCount * config.purchaseGoldPrice;
          this.settlementHistory.push({
            stepNumber: globalStepNumber++,
            stepType: 'PAYMENT_PROCESSING',
            stepDescription: `Processed payment for team ${delivery.teamId}`,
            tileId: requirement.tileId,
            totalPaymentAmount: paymentAmount
          });
        }
      });

      this.settlementHistory.push({
        stepNumber: globalStepNumber++,
        stepType: 'TILE_PROCESSING_COMPLETE',
        stepDescription: `Completed settlement for tile ${requirement.tileName}`,
        tileId: requirement.tileId,
        productsSettled: settlements.length,
        processingDuration: Math.random() * 1000
      });

      settlementsByTile.set(tileId, settlements);
    });

    return settlementsByTile;
  }

  private validateProductAgainstFormula(
    productId: string,
    formulaId: number
  ): boolean {
    return Math.random() > 0.1;
  }

  calculateTransportationFee(
    distance: number,
    productCount: number
  ): number {
    const baseRate = distance * 0.1;
    const volumeMultiplier = Math.ceil(productCount / 100);
    return Math.round(baseRate * volumeMultiplier * 100) / 100;
  }

  calculateDistance(
    originTileId: string,
    destinationTileId: string
  ): number {
    const originCoords = this.parseTileCoordinates(originTileId);
    const destCoords = this.parseTileCoordinates(destinationTileId);

    return Math.sqrt(
      Math.pow(destCoords.x - originCoords.x, 2) +
      Math.pow(destCoords.y - originCoords.y, 2)
    );
  }

  private parseTileCoordinates(tileId: string): { x: number; y: number } {
    const match = tileId.match(/(\d+)-(\d+)/);
    if (match) {
      return { x: parseInt(match[1]), y: parseInt(match[2]) };
    }
    return { x: 0, y: 0 };
  }

  getCalculationHistory(): CalculationStep[] {
    return this.calculationHistory;
  }

  getSettlementHistory(): SettlementStep[] {
    return this.settlementHistory;
  }

  generateStatistics(
    requirement: MtoType1Requirement,
    tileRequirements: MtoType1TileRequirementInternal[],
    deliveries: MtoType1Delivery[]
  ) {
    const totalRequirement = tileRequirements.reduce((sum, t) => sum + t.adjustedRequirement, 0);
    const totalDelivered = deliveries.reduce((sum, d) => sum + ((d as MtoType1DeliveryInternal).deliveryNumber || d.productQuantity || 0), 0);
    const totalSettled = deliveries.reduce((sum, d) => sum + ((d as any).settledNumber || 0), 0);
    const fulfillmentRate = totalRequirement > 0 ? (totalSettled / totalRequirement) * 100 : 0;
    const tilesWithRequirement = tileRequirements.filter(t => t.adjustedRequirement > 0).length;
    const tilesWithDelivery = new Set(deliveries.map(d => d.tileId)).size;

    return {
      totalRequirement,
      totalDelivered,
      totalSettled,
      totalUnsettled: totalDelivered - totalSettled,
      fulfillmentRate: Math.round(fulfillmentRate * 100) / 100,
      activeTiles: tilesWithRequirement,
      tilesWithDelivery,
      averageDeliveryPerTile: tilesWithDelivery > 0 ? Math.round(totalDelivered / tilesWithDelivery) : 0,
      totalBudget: requirement.overallPurchaseBudget || 0,
      spentBudget: totalSettled * (requirement.purchaseGoldPrice || 0),
      remainingBudget: (requirement.overallPurchaseBudget || 0) - (totalSettled * (requirement.purchaseGoldPrice || 0)),
      uniqueTeams: new Set(deliveries.map(d => d.teamId)).size
    };
  }

  validateDelivery(
    delivery: Partial<MtoType1Delivery>,
    tileRequirement: MtoType1TileRequirementInternal,
    teamBalance: number,
    transportationFee: number
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!delivery.teamId) {
      errors.push('Team ID is required');
    }

    const deliveryInternal = delivery as MtoType1DeliveryInternal;
    if (!deliveryInternal.mapTileId && !delivery.tileId) {
      errors.push('Tile ID is required');
    }

    const quantity = deliveryInternal.deliveryNumber || delivery.productQuantity || 0;
    if (quantity <= 0) {
      errors.push('Delivery quantity must be greater than 0');
    }

    if (quantity && quantity > tileRequirement.remainingQuantity) {
      errors.push(`Delivery quantity (${quantity}) exceeds remaining requirement (${tileRequirement.remainingQuantity})`);
    }

    if (teamBalance < transportationFee) {
      errors.push(`Insufficient balance. Required: ${transportationFee}, Available: ${teamBalance}`);
    }

    const currentTime = new Date();
    const releaseTime = new Date(tileRequirement.createdAt);
    const settlementTime = new Date(tileRequirement.updatedAt);

    if (currentTime < releaseTime) {
      errors.push('Requirement not yet released');
    }

    if (currentTime > settlementTime) {
      errors.push('Settlement period has ended');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}