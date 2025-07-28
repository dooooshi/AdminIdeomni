export interface MapTile {
	id: number;
	axialQ: number;
	axialR: number;
	landType: 'MARINE' | 'PLAIN' | 'COASTAL';
	isActive?: boolean;
	// Economic data for activity mode
	currentPrice?: number;
	currentPopulation?: number;
	transportationCostUnit?: number;
	isModified?: boolean; // For highlighting modified tiles
}

export interface HexagonalMapProps {
	tiles: MapTile[];
	width?: number;
	height?: number;
	onTileClick?: (tile: MapTile) => void;
	onTileSelect?: (tileId: number) => void;
	selectedTileId?: number | null;
	zoomLevel?: number;
	onZoomChange?: (zoomLevel: number) => void;
	// Activity tile state management mode
	showEconomicData?: boolean;
	activityMode?: boolean;
}

export interface HexagonalMapRef {
	zoomIn: () => void;
	zoomOut: () => void;
	resetZoom: () => void;
}

export interface Transform {
	x: number;
	y: number;
	scale: number;
}

export interface Point {
	x: number;
	y: number;
}

export interface Bounds {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

export interface ZoomConfig {
	minZoom: number;
	maxZoom: number;
	zoomStep: number;
	animationDuration: number;
}

export interface HexConfig {
	baseSize: number;
	spacing: number;
}

export interface HexTileProps {
	tile: MapTile;
	hexPath: string;
	position: Point;
	isHovered: boolean;
	onTileClick?: (tile: MapTile) => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}

export interface MapBackgroundProps {
	bounds: Bounds;
	hexConfig: HexConfig;
}

// Map Template Management Types
export interface MapTemplate {
	id: number;
	name: string;
	description?: string;
	version?: string;
	width?: number;
	height?: number;
	isActive: boolean;
	isDefault?: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string | null;
	createdBy?: {
		id: string;
		username: string;
		email: string;
	};
	// Additional properties from enhanced template
	tiles?: MapTile[];
	tileCount?: number;
}

export interface CreateMapTemplateDto {
	name: string;
	description?: string;
	width: number;
	height: number;
}

export interface UpdateMapTemplateDto {
	name?: string;
	description?: string;
	isActive?: boolean;
}

export interface GenerateMapTemplateDto {
	name: string;
	description?: string;
	width: number;
	height: number;
	marinePercentage: number;
	coastalPercentage: number;
	plainPercentage: number;
	randomSeed?: number;
}

export interface CreateTileDto {
	axialQ: number;
	axialR: number;
	landType: 'MARINE' | 'PLAIN' | 'COASTAL';
	templateId: number;
}

export interface UpdateTileDto {
	landType?: 'MARINE' | 'PLAIN' | 'COASTAL';
	isActive?: boolean;
}

export interface ActivityTileState {
	id: number;
	activityId: string;
	tileId: number;
	currentPrice: number;
	currentPopulation: number;
	transportationCostUnit: number;
	lastModifiedAt: string;
	lastModifiedBy?: {
		id: string;
		username: string;
	};
	changeReason?: string;
	tile: MapTile;
}

export interface CreateActivityTileStateDto {
	activityId: string;
	tileId: number;
	currentPrice: number;
	currentPopulation: number;
	transportationCostUnit: number;
	changeReason?: string;
}

export interface UpdateActivityTileStateDto {
	currentPrice?: number;
	currentPopulation?: number;
	transportationCostUnit?: number;
	changeReason?: string;
}

export interface BulkUpdateActivityTileStatesDto {
	activityId: string;
	updates: Array<{
		tileId: number;
		currentPrice?: number;
		currentPopulation?: number;
		transportationCostUnit?: number;
	}>;
	changeReason?: string;
}

export interface ActivityTileStatistics {
	totalTiles: number;
	modifiedTiles: number;
	averagePrice: number;
	averagePopulation: number;
	totalValue: number;
	landTypeBreakdown: {
		MARINE: { count: number; totalValue: number };
		COASTAL: { count: number; totalValue: number };
		PLAIN: { count: number; totalValue: number };
	};
}

export interface GetMapTemplatesQueryParams {
	page?: number;
	pageSize?: number;
	name?: string;
	isActive?: boolean;
	createdBy?: string;
}

export interface GetTilesQueryParams {
	templateId?: number;
	landType?: 'MARINE' | 'PLAIN' | 'COASTAL';
	isActive?: boolean;
	page?: number;
	pageSize?: number;
}

export interface GetActivityTileStatesQueryParams {
	activityId: string;
	tileId?: number;
	landType?: 'MARINE' | 'PLAIN' | 'COASTAL';
	isModified?: boolean;
	page?: number;
	pageSize?: number;
}

export interface ApiResponse<T> {
	success: boolean;
	businessCode: number;
	message: string;
	data: T;
	timestamp: string;
	path: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

// ==================== TILE FACILITY BUILD CONFIGURATION TYPES ====================

// Land Types
export enum LandType {
	MARINE = 'MARINE',
	COASTAL = 'COASTAL',
	PLAIN = 'PLAIN'
}

// Facility Types
export enum FacilityType {
	// Resource Extraction
	MINE = 'MINE',
	QUARRY = 'QUARRY',
	FOREST = 'FOREST',
	FARM = 'FARM',
	RANCH = 'RANCH',
	FISHERY = 'FISHERY',
	// Manufacturing
	FACTORY = 'FACTORY',
	WAREHOUSE = 'WAREHOUSE',
	// Commercial
	MALL = 'MALL',
	MEDIA_BUILDING = 'MEDIA_BUILDING',
	CINEMA = 'CINEMA',
	// Infrastructure
	WATER_PLANT = 'WATER_PLANT',
	POWER_PLANT = 'POWER_PLANT',
	BASE_STATION = 'BASE_STATION',
	// Services
	FIRE_STATION = 'FIRE_STATION',
	SCHOOL = 'SCHOOL',
	HOSPITAL = 'HOSPITAL',
	PARK = 'PARK'
}

// Tile Facility Build Configuration
export interface TileFacilityBuildConfig {
	id: string;
	templateId: number;
	landType: LandType;
	facilityType: FacilityType;
	requiredGold: number;
	requiredCarbon: number;
	requiredAreas: number;
	maxLevel: number;
	upgradeGoldCost: number;
	upgradeCarbonCost: number;
	upgradeMultiplier: number;
	isAllowed: boolean;
	maxInstances: number;
	upgradeData?: Record<string, any>;
	buildData?: Record<string, any>;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string | null;
}

// Request DTOs
export interface CreateTileFacilityBuildConfigDto {
	landType: LandType;
	facilityType: FacilityType;
	requiredGold: number;
	requiredCarbon: number;
	requiredAreas: number;
	maxLevel: number;
	upgradeGoldCost: number;
	upgradeCarbonCost: number;
	upgradeMultiplier: number;
	isAllowed: boolean;
	maxInstances: number;
	upgradeData?: Record<string, any>;
	buildData?: Record<string, any>;
}

export interface UpdateTileFacilityBuildConfigDto {
	requiredGold?: number;
	requiredCarbon?: number;
	requiredAreas?: number;
	maxLevel?: number;
	upgradeGoldCost?: number;
	upgradeCarbonCost?: number;
	upgradeMultiplier?: number;
	isAllowed?: boolean;
	maxInstances?: number;
	upgradeData?: Record<string, any>;
	buildData?: Record<string, any>;
}

// Bulk Update DTOs
export interface BulkUpdateByLandTypeDto {
	// Multipliers
	requiredGoldMultiplier?: number;
	requiredCarbonMultiplier?: number;
	upgradeGoldCostMultiplier?: number;
	upgradeCarbonCostMultiplier?: number;
	// Fixed values (overrides multipliers)
	fixedRequiredGold?: number;
	fixedRequiredCarbon?: number;
	fixedMaxLevel?: number;
	// Status updates
	isAllowed?: boolean;
}

export interface BulkUpdateResult {
	updated: number;
	failed: number;
	details: Array<{
		configId: string;
		success: boolean;
		error?: string;
	}>;
	message?: string;
}

// Query Parameters
export interface GetTileFacilityConfigsQueryParams {
	landType?: LandType;
	facilityType?: FacilityType;
	isAllowed?: boolean;
	isActive?: boolean;
	isUpgradable?: boolean;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	page?: number;
	pageSize?: number;
}

// Upgrade Cost Calculation
export interface UpgradeCostCalculation {
	facilityType: FacilityType;
	landType: LandType;
	currentLevel: number;
	targetLevel: number;
	upgradeCosts: Array<{
		level: number;
		goldCost: number;
		carbonCost: number;
	}>;
	totalCost: {
		gold: number;
		carbon: number;
	};
}

// Statistics
export interface TileFacilityConfigStatistics {
	totalConfigs: number;
	allowedConfigs: number;
	disallowedConfigs: number;
	configsByLandType: Record<LandType, number>;
	upgradableConfigs: number;
	averageCosts: {
		requiredGold: number;
		requiredCarbon: number;
		upgradeGoldCost: number;
		upgradeCarbonCost: number;
	};
	costRanges: {
		goldRange: { min: number; max: number };
		carbonRange: { min: number; max: number };
	};
	maxLevelDistribution: Record<string, number>;
	facilityTypeBreakdown: Record<FacilityType, {
		total: number;
		allowed: number;
		averageGoldCost: number;
	}>;
}

// Map Template with Enhanced Data
export interface EnhancedMapTemplate extends MapTemplate {
	tiles?: MapTile[];
	tileCount?: number;
	landTypeDistribution?: Record<LandType, number>;
	economicStatistics?: {
		totalInitialValue: number;
		totalInitialPopulation: number;
		averagePrice: number;
		averagePopulation: number;
		averageTransportationCost: number;
		priceByLandType: Record<LandType, number>;
		populationByLandType: Record<LandType, number>;
	};
	facilityConfigStatistics?: TileFacilityConfigStatistics;
} 