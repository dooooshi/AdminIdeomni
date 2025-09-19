import {
  MtoType1Requirement,
  MtoType1TileRequirement,
  MtoType1Delivery,
  MtoType1Settlement,
  MtoType1CalculationHistory,
  MtoType1SettlementHistory,
  MtoType1RequirementStatus,
  MtoType1DeliveryStatus,
  MtoType1SettlementStatus
} from '@/lib/types/mtoType1';
import { MtoType1Calculator, TilePopulationData, MtoCalculationConfig } from '@/lib/utils/mtoType1Calculator';

export class MtoType1MockService {
  private requirements: Map<string, MtoType1Requirement> = new Map();
  private tileRequirements: Map<string, MtoType1TileRequirement[]> = new Map();
  private deliveries: Map<string, MtoType1Delivery[]> = new Map();
  private settlements: Map<string, MtoType1Settlement[]> = new Map();
  private calculationHistories: Map<string, MtoType1CalculationHistory[]> = new Map();
  private settlementHistories: Map<string, MtoType1SettlementHistory[]> = new Map();
  private calculator = new MtoType1Calculator();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const sampleRequirements = this.generateSampleRequirements();
    sampleRequirements.forEach(req => {
      this.requirements.set(req.id, req);
      this.tileRequirements.set(req.id, this.generateTileRequirements(req));
      this.deliveries.set(req.id, this.generateDeliveries(req));
      this.settlements.set(req.id, this.generateSettlements(req));
      this.calculationHistories.set(req.id, this.generateCalculationHistory(req));
      this.settlementHistories.set(req.id, this.generateSettlementHistory(req));
    });
  }

  private generateSampleRequirements(): MtoType1Requirement[] {
    const now = new Date();
    const statuses: MtoType1RequirementStatus[] = ['DRAFT', 'RELEASED', 'IN_PROGRESS', 'SETTLING', 'SETTLED'];

    return statuses.map((status, index) => ({
      id: `req-${index + 1}`,
      managerId: 'manager-1',
      managerName: 'John Manager',
      managerProductFormulaId: 100 + index,
      productName: `Product Formula ${index + 1}`,
      purchaseGoldPrice: 100 + index * 10,
      basePurchaseNumber: 50 + index * 5,
      overallPurchaseNumber: 1000 + index * 100,
      baseCountPopulationNumber: 1000,
      overallPurchaseBudget: (1000 + index * 100) * (100 + index * 10),
      requirementStatus: status,
      releaseTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      settlementTime: new Date(now.getTime() + (index === 4 ? -1 : 7) * 24 * 60 * 60 * 1000),
      actualSettlementTime: status === 'SETTLED' ? new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) : null,
      cancelledAt: null,
      cancellationReason: null,
      totalInitialRequirement: 1500,
      totalAdjustedRequirement: 1000 + index * 100,
      totalDeliveredNumber: status === 'IN_PROGRESS' || status === 'SETTLING' || status === 'SETTLED' ? 800 + index * 50 : 0,
      totalSettledNumber: status === 'SETTLED' ? 700 + index * 40 : 0,
      totalUnsettledNumber: status === 'SETTLED' ? 100 + index * 10 : 0,
      totalSettledAmount: status === 'SETTLED' ? (700 + index * 40) * (100 + index * 10) : 0,
      tilesWithRequirement: 15,
      tilesWithDelivery: status === 'IN_PROGRESS' || status === 'SETTLING' || status === 'SETTLED' ? 12 : 0,
      uniqueTeamsDelivered: status === 'IN_PROGRESS' || status === 'SETTLING' || status === 'SETTLED' ? 8 : 0,
      averageDeliveryTime: status === 'SETTLED' ? 3.5 : null,
      fulfillmentRate: status === 'SETTLED' ? 70 + index * 5 : null,
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: now
    }));
  }

  private generateTileRequirements(requirement: MtoType1Requirement): MtoType1TileRequirement[] {
    const tiles: TilePopulationData[] = Array.from({ length: 15 }, (_, i) => ({
      tileId: `tile-${i + 1}`,
      tileName: `Zone ${String.fromCharCode(65 + i)}`,
      currentPopulation: Math.floor(Math.random() * 10000) + 1000
    }));

    const config: MtoCalculationConfig = {
      managerProductFormulaId: requirement.managerProductFormulaId,
      purchaseGoldPrice: requirement.purchaseGoldPrice,
      basePurchaseNumber: requirement.basePurchaseNumber,
      overallPurchaseNumber: requirement.overallPurchaseNumber,
      baseCountPopulationNumber: requirement.baseCountPopulationNumber
    };

    const calculatedRequirements = this.calculator.calculateInitialRequirements(tiles, config);
    const requirements = Array.from(calculatedRequirements.values());

    requirements.forEach(req => {
      req.mtoType1Id = requirement.id;
      req.id = `tile-req-${requirement.id}-${req.mapTileId}`;

      if (requirement.requirementStatus === 'IN_PROGRESS' ||
          requirement.requirementStatus === 'SETTLING' ||
          requirement.requirementStatus === 'SETTLED') {
        const deliveredRatio = Math.random() * 0.8;
        req.deliveredNumber = Math.floor(req.adjustedRequirement * deliveredRatio);
        req.remainingRequirement = req.adjustedRequirement - req.deliveredNumber;
      }
    });

    return requirements;
  }

  private generateDeliveries(requirement: MtoType1Requirement): MtoType1Delivery[] {
    if (requirement.requirementStatus === 'DRAFT' || requirement.requirementStatus === 'RELEASED') {
      return [];
    }

    const deliveries: MtoType1Delivery[] = [];
    const teams = ['team-1', 'team-2', 'team-3', 'team-4', 'team-5', 'team-6', 'team-7', 'team-8'];
    const tiles = ['tile-1', 'tile-2', 'tile-3', 'tile-4', 'tile-5', 'tile-6', 'tile-7', 'tile-8', 'tile-9', 'tile-10', 'tile-11', 'tile-12'];

    tiles.forEach((tileId, tileIndex) => {
      const numDeliveries = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numDeliveries && i < teams.length; i++) {
        const deliveryNumber = Math.floor(Math.random() * 50) + 10;
        const settledNumber = requirement.requirementStatus === 'SETTLED'
          ? Math.floor(deliveryNumber * (Math.random() * 0.3 + 0.7))
          : 0;

        deliveries.push({
          id: `delivery-${requirement.id}-${tileId}-${i}`,
          mtoType1Id: requirement.id,
          mtoType1RequirementId: requirement.id,
          teamId: teams[i],
          teamName: `Team ${teams[i].split('-')[1]}`,
          mapTileId: tileId,
          tileName: `Zone ${String.fromCharCode(65 + tileIndex)}`,
          facilityInstanceId: `facility-${i}`,
          facilityInstanceName: `Facility ${i + 1}`,
          deliveryNumber,
          deliveryStatus: requirement.requirementStatus === 'SETTLED' ? 'SETTLED' : 'PENDING',
          transportationFee: Math.random() * 100 + 50,
          transportationPaid: true,
          transportationTransactionId: `trans-${Date.now()}-${i}`,
          deliveredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          settledNumber,
          unsettledNumber: deliveryNumber - settledNumber,
          settlementAmount: settledNumber * requirement.purchaseGoldPrice,
          returnRequested: false,
          returnFacilityId: null,
          returnTransportationFee: null,
          returnStatus: null,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        });
      }
    });

    return deliveries;
  }

  private generateSettlements(requirement: MtoType1Requirement): MtoType1Settlement[] {
    if (requirement.requirementStatus !== 'SETTLED') {
      return [];
    }

    const settlements: MtoType1Settlement[] = [];
    const deliveries = this.deliveries.get(requirement.id) || [];

    deliveries.forEach(delivery => {
      for (let i = 0; i < (delivery.settledNumber || 0); i++) {
        settlements.push({
          id: `settlement-${delivery.id}-${i}`,
          mtoType1Id: requirement.id,
          mtoType1DeliveryId: delivery.id,
          productId: `product-${delivery.id}-${i}`,
          productName: `${requirement.productName} #${i + 1}`,
          settlementStatus: 'SETTLED',
          settlementAmount: requirement.purchaseGoldPrice,
          settlementTime: requirement.actualSettlementTime!,
          paymentStatus: 'PAID',
          paymentTransactionId: `payment-${Date.now()}-${i}`,
          createdAt: requirement.actualSettlementTime!,
          updatedAt: new Date()
        });
      }
    });

    return settlements;
  }

  private generateCalculationHistory(requirement: MtoType1Requirement): MtoType1CalculationHistory[] {
    const history = this.calculator.getCalculationHistory();

    return history.map((step, index) => ({
      id: `calc-hist-${requirement.id}-${index}`,
      mtoType1Id: requirement.id,
      calculationStep: step.stepNumber,
      stepType: step.stepType,
      stepDescription: step.stepDescription,
      totalInitialRequirement: step.totalInitialRequirement,
      totalAdjustedRequirement: step.totalAdjustedRequirement,
      tilesSetToZero: step.tilesSetToZero,
      tileAdjustments: step.tileAdjustments ? JSON.stringify(step.tileAdjustments) : null,
      budgetSaved: step.budgetSaved || null,
      createdAt: new Date()
    }));
  }

  private generateSettlementHistory(requirement: MtoType1Requirement): MtoType1SettlementHistory[] {
    if (requirement.requirementStatus !== 'SETTLED') {
      return [];
    }

    const tileReqs = this.tileRequirements.get(requirement.id) || [];
    const deliveries = this.deliveries.get(requirement.id) || [];

    const config: MtoCalculationConfig = {
      managerProductFormulaId: requirement.managerProductFormulaId,
      purchaseGoldPrice: requirement.purchaseGoldPrice,
      basePurchaseNumber: requirement.basePurchaseNumber,
      overallPurchaseNumber: requirement.overallPurchaseNumber,
      baseCountPopulationNumber: requirement.baseCountPopulationNumber
    };

    const tileReqMap = new Map(tileReqs.map(tr => [tr.mapTileId, tr]));
    this.calculator.simulateSettlement(tileReqMap, deliveries, config);

    const history = this.calculator.getSettlementHistory();

    return history.map((step, index) => ({
      id: `settle-hist-${requirement.id}-${index}`,
      mtoType1Id: requirement.id,
      settlementStep: step.stepNumber,
      stepType: step.stepType,
      stepDescription: step.stepDescription,
      tileId: step.tileId || null,
      tileName: step.tileName || null,
      tileRequirement: step.tileRequirement || null,
      deliveriesProcessed: step.deliveriesProcessed || null,
      productsValidated: step.productsValidated || null,
      productsSettled: step.productsSettled || null,
      productsRejected: step.productsRejected || null,
      totalPaymentAmount: step.totalPaymentAmount || null,
      processingDuration: step.processingDuration || null,
      validationDetails: step.validationDetails ? JSON.stringify(step.validationDetails) : null,
      createdAt: requirement.actualSettlementTime!
    }));
  }

  async getRequirements(status?: MtoType1RequirementStatus): Promise<MtoType1Requirement[]> {
    await this.simulateDelay();
    const requirements = Array.from(this.requirements.values());

    if (status) {
      return requirements.filter(req => req.requirementStatus === status);
    }

    return requirements;
  }

  async getRequirementById(id: string): Promise<MtoType1Requirement | null> {
    await this.simulateDelay();
    return this.requirements.get(id) || null;
  }

  async getTileRequirements(mtoType1Id: string): Promise<MtoType1TileRequirement[]> {
    await this.simulateDelay();
    return this.tileRequirements.get(mtoType1Id) || [];
  }

  async getDeliveries(mtoType1Id: string): Promise<MtoType1Delivery[]> {
    await this.simulateDelay();
    return this.deliveries.get(mtoType1Id) || [];
  }

  async getSettlements(mtoType1Id: string): Promise<MtoType1Settlement[]> {
    await this.simulateDelay();
    return this.settlements.get(mtoType1Id) || [];
  }

  async getCalculationHistory(mtoType1Id: string): Promise<MtoType1CalculationHistory[]> {
    await this.simulateDelay();
    return this.calculationHistories.get(mtoType1Id) || [];
  }

  async getSettlementHistory(mtoType1Id: string): Promise<MtoType1SettlementHistory[]> {
    await this.simulateDelay();
    return this.settlementHistories.get(mtoType1Id) || [];
  }

  async createRequirement(data: Partial<MtoType1Requirement>): Promise<MtoType1Requirement> {
    await this.simulateDelay();

    const requirement: MtoType1Requirement = {
      id: `req-${Date.now()}`,
      managerId: data.managerId || 'manager-1',
      managerName: data.managerName || 'John Manager',
      managerProductFormulaId: data.managerProductFormulaId || 100,
      productName: data.productName || 'New Product',
      purchaseGoldPrice: data.purchaseGoldPrice || 100,
      basePurchaseNumber: data.basePurchaseNumber || 50,
      overallPurchaseNumber: data.overallPurchaseNumber || 1000,
      baseCountPopulationNumber: data.baseCountPopulationNumber || 1000,
      overallPurchaseBudget: (data.overallPurchaseNumber || 1000) * (data.purchaseGoldPrice || 100),
      requirementStatus: 'DRAFT',
      releaseTime: data.releaseTime || new Date(),
      settlementTime: data.settlementTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      actualSettlementTime: null,
      cancelledAt: null,
      cancellationReason: null,
      totalInitialRequirement: 0,
      totalAdjustedRequirement: 0,
      totalDeliveredNumber: 0,
      totalSettledNumber: 0,
      totalUnsettledNumber: 0,
      totalSettledAmount: 0,
      tilesWithRequirement: 0,
      tilesWithDelivery: 0,
      uniqueTeamsDelivered: 0,
      averageDeliveryTime: null,
      fulfillmentRate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.requirements.set(requirement.id, requirement);
    this.tileRequirements.set(requirement.id, this.generateTileRequirements(requirement));
    this.calculationHistories.set(requirement.id, this.generateCalculationHistory(requirement));

    return requirement;
  }

  async submitDelivery(data: Partial<MtoType1Delivery>): Promise<MtoType1Delivery> {
    await this.simulateDelay();

    const delivery: MtoType1Delivery = {
      id: `delivery-${Date.now()}`,
      mtoType1Id: data.mtoType1Id || 'req-1',
      mtoType1RequirementId: data.mtoType1RequirementId || 'req-1',
      teamId: data.teamId || 'team-1',
      teamName: data.teamName || 'Team 1',
      mapTileId: data.mapTileId || 'tile-1',
      tileName: data.tileName || 'Zone A',
      facilityInstanceId: data.facilityInstanceId || 'facility-1',
      facilityInstanceName: data.facilityInstanceName || 'Facility 1',
      deliveryNumber: data.deliveryNumber || 10,
      deliveryStatus: 'PENDING',
      transportationFee: data.transportationFee || 100,
      transportationPaid: true,
      transportationTransactionId: `trans-${Date.now()}`,
      deliveredAt: new Date(),
      settledNumber: 0,
      unsettledNumber: data.deliveryNumber || 10,
      settlementAmount: 0,
      returnRequested: false,
      returnFacilityId: null,
      returnTransportationFee: null,
      returnStatus: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingDeliveries = this.deliveries.get(delivery.mtoType1Id) || [];
    existingDeliveries.push(delivery);
    this.deliveries.set(delivery.mtoType1Id, existingDeliveries);

    return delivery;
  }

  async getStatistics(mtoType1Id: string) {
    await this.simulateDelay();

    const requirement = this.requirements.get(mtoType1Id);
    const tileRequirements = this.tileRequirements.get(mtoType1Id) || [];
    const deliveries = this.deliveries.get(mtoType1Id) || [];

    if (!requirement) {
      return null;
    }

    return this.calculator.generateStatistics(requirement, tileRequirements, deliveries);
  }

  private async simulateDelay(min: number = 100, max: number = 500) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

export const mtoType1MockService = new MtoType1MockService();