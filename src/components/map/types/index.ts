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
	width: number;
	height: number;
	isActive: boolean;
	isDefault?: boolean;
	createdAt: string;
	updatedAt: string;
	createdBy?: {
		id: string;
		username: string;
		email: string;
	};
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