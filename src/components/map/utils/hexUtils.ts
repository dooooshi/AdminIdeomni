import { Point, Bounds, HexConfig, MapTile } from '../types';

/**
 * Utility functions for hexagonal grid calculations
 */

/**
 * Convert axial coordinates to pixel coordinates
 * @param q - Axial Q coordinate
 * @param r - Axial R coordinate
 * @param hexConfig - Hexagon configuration
 * @returns Pixel coordinates
 */
export const axialToPixel = (q: number, r: number, hexConfig: HexConfig): Point => {
	const { baseSize, spacing } = hexConfig;
	const x = (baseSize + spacing) * Math.sqrt(3) * (q + r / 2);
	const y = (baseSize + spacing) * (3 / 2) * r;
	return { x, y };
};

/**
 * Generate hexagon path for SVG (pointy-top orientation)
 * @param centerX - Center X coordinate
 * @param centerY - Center Y coordinate
 * @param size - Hexagon size
 * @returns SVG path string
 */
export const generateHexPath = (centerX: number, centerY: number, size: number): string => {
	const points = [];
	for (let i = 0; i < 6; i++) {
		const angle = (Math.PI / 180) * (60 * i - 90);
		const x = centerX + size * Math.cos(angle);
		const y = centerY + size * Math.sin(angle);
		points.push(`${x},${y}`);
	}
	return `M ${points.join(' L ')} Z`;
};

/**
 * Calculate bounds for a collection of tiles
 * @param tiles - Array of map tiles
 * @param hexConfig - Hexagon configuration
 * @returns Bounds object
 */
export const calculateBounds = (tiles: MapTile[], hexConfig: HexConfig): Bounds => {
	if (tiles.length === 0) {
		return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
	}

	const positions = tiles.map(tile => axialToPixel(tile.axialQ, tile.axialR, hexConfig));
	const padding = hexConfig.baseSize * 1.5;
	
	const minX = Math.min(...positions.map(p => p.x)) - padding;
	const maxX = Math.max(...positions.map(p => p.x)) + padding;
	const minY = Math.min(...positions.map(p => p.y)) - padding;
	const maxY = Math.max(...positions.map(p => p.y)) + padding;
	
	return { minX, maxX, minY, maxY };
};

/**
 * Calculate hexagon dimensions
 * @param size - Hexagon size
 * @returns Width and height of hexagon
 */
export const getHexDimensions = (size: number) => {
	const width = size * Math.sqrt(3);
	const height = size * 2;
	return { width, height };
};

/**
 * Clamp a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export const clamp = (value: number, min: number, max: number): number => {
	return Math.max(min, Math.min(max, value));
};

/**
 * Get all 6 adjacent hexagon coordinates in axial coordinate system
 * @param q - Axial Q coordinate
 * @param r - Axial R coordinate
 * @returns Array of adjacent coordinates
 */
export const getAdjacentCoordinates = (q: number, r: number): Array<{q: number, r: number}> => {
	// The 6 directions in axial coordinates
	const directions = [
		{q: 1, r: 0},   // right
		{q: 1, r: -1},  // top-right
		{q: 0, r: -1},  // top-left
		{q: -1, r: 0},  // left
		{q: -1, r: 1},  // bottom-left
		{q: 0, r: 1}    // bottom-right
	];
	
	return directions.map(dir => ({
		q: q + dir.q,
		r: r + dir.r
	}));
};

/**
 * Find tiles of the same land type that are adjacent to the given tile
 * @param tile - The reference tile
 * @param allTiles - Array of all tiles to search through
 * @returns Array of adjacent tiles with same land type
 */
export const findAdjacentSameLandType = (tile: MapTile, allTiles: MapTile[]): MapTile[] => {
	const adjacentCoords = getAdjacentCoordinates(tile.axialQ, tile.axialR);
	
	return allTiles.filter(otherTile => 
		otherTile.landType === tile.landType &&
		otherTile.id !== tile.id &&
		adjacentCoords.some(coord => 
			coord.q === otherTile.axialQ && coord.r === otherTile.axialR
		)
	);
};

/**
 * Calculate the direction angle between two adjacent hexagon tiles
 * @param fromTile - Source tile
 * @param toTile - Target tile
 * @returns Angle in degrees (0-360)
 */
export const getDirectionAngle = (fromTile: MapTile, toTile: MapTile): number => {
	const deltaQ = toTile.axialQ - fromTile.axialQ;
	const deltaR = toTile.axialR - fromTile.axialR;
	
	// Map axial directions to angles (in degrees)
	const directionAngles: {[key: string]: number} = {
		'1,0': 0,     // right
		'1,-1': 60,   // top-right
		'0,-1': 120,  // top-left
		'-1,0': 180,  // left
		'-1,1': 240,  // bottom-left
		'0,1': 300    // bottom-right
	};
	
	const key = `${deltaQ},${deltaR}`;
	return directionAngles[key] || 0;
}; 