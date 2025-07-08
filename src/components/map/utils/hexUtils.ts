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