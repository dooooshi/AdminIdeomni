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