'use client';

/**
 * HexagonalMapAdmin Component - Administrative Map for Configuration
 * 
 * This is a specialized version of HexagonalMap designed specifically for
 * administrative configuration tasks. It excludes animations and focuses
 * on configuration functionality.
 * 
 * Features:
 * - No land type animations (for better performance and focus)
 * - Optimized for tile configuration
 * - Enhanced tile selection feedback
 * - Admin-specific styling
 * - Configuration mode support
 * 
 * Used by:
 * - Map Template Management
 * - Tile Configuration Interface
 * - Administrative Dashboard
 */

import React, { useMemo, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { Box } from '@mui/material';
import { 
	HexagonalMapProps, 
	HexagonalMapRef, 
	ZoomConfig, 
	HexConfig 
} from '../types';
import { useMapZoom } from '../hooks/useMapZoom';
import { axialToPixel, generateHexPath, calculateBounds } from '../utils/hexUtils';
import MapBackground from './MapBackground';
import HexTileAdmin from './HexTileAdmin';

// Configuration constants
const ZOOM_CONFIG: ZoomConfig = {
	minZoom: 0.5,
	maxZoom: 3,
	zoomStep: 0.2,
	animationDuration: 200
};

const HEX_CONFIG: HexConfig = {
	baseSize: 28,
	spacing: 4
};

const MapContainer = styled(Box)(({ theme }) => ({
	position: 'relative',
	width: '100%',
	height: '100%',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: theme.palette.mode === 'dark' 
		? alpha(theme.palette.background.paper, 0.02)
		: alpha(theme.palette.background.default, 0.3),
	borderRadius: theme.spacing(2),
	border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
	overflow: 'hidden',
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	cursor: 'grab',
	'&:active': {
		cursor: 'grabbing',
	},
}));

const StyledSVG = styled('svg')<{ $isAnimating?: boolean }>(({ theme, $isAnimating }) => ({
	width: '100%',
	height: '100%',
	maxWidth: '100%',
	maxHeight: '100%',
	transition: $isAnimating 
		? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
		: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const HexagonalMapAdmin = forwardRef<HexagonalMapRef, HexagonalMapProps>(({
	tiles,
	width = 800,
	height = 500,
	onTileClick,
	onTileRightClick,
	onTileHover,
	onTileHoverEnd,
	zoomLevel = 1,
	onZoomChange,
	configurationMode = false,
	selectedTileId,
	showEconomicData = false,
	activityMode = false
}, ref) => {
	const theme = useTheme();
	const [hoveredTile, setHoveredTile] = useState<number | null>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Use custom zoom hook
	const {
		transform,
		isAnimating,
		isDragging,
		zoomIn,
		zoomOut,
		resetZoom,
		handleWheel,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp
	} = useMapZoom({
		initialZoom: zoomLevel,
		zoomConfig: ZOOM_CONFIG,
		onZoomChange
	});

	// Calculate map bounds
	const bounds = useMemo(() => {
		return calculateBounds(tiles, HEX_CONFIG);
	}, [tiles]);

	const viewBoxWidth = bounds.maxX - bounds.minX;
	const viewBoxHeight = bounds.maxY - bounds.minY;

	// Expose zoom methods via ref
	useImperativeHandle(ref, () => ({
		zoomIn,
		zoomOut,
		resetZoom
	}), [zoomIn, zoomOut, resetZoom]);

	// Handle wheel events with container reference
	const handleWheelEvent = (event: React.WheelEvent) => {
		handleWheel(event, containerRef);
	};

	return (
		<MapContainer 
			ref={containerRef} 
			onWheel={handleWheelEvent} 
			onMouseDown={handleMouseDown} 
			onMouseMove={handleMouseMove} 
			onMouseUp={handleMouseUp}
		>
			<StyledSVG
				viewBox={`${bounds.minX} ${bounds.minY} ${viewBoxWidth} ${viewBoxHeight}`}
				preserveAspectRatio="xMidYMid meet"
				ref={svgRef}
				$isAnimating={isAnimating}
				style={{
					transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
				}}
			>
				{/* Background patterns and gradients */}
				<MapBackground bounds={bounds} hexConfig={HEX_CONFIG} />

				{/* Render hexagonal tiles - ADMIN VERSION (NO ANIMATIONS) */}
				{tiles.map((tile) => {
					const position = axialToPixel(tile.axialQ, tile.axialR, HEX_CONFIG);
					const hexPath = generateHexPath(position.x, position.y, HEX_CONFIG.baseSize);
					const isHovered = hoveredTile === tile.id;
					const isSelected = configurationMode && selectedTileId === tile.id;

					return (
						<HexTileAdmin
							key={tile.id}
							tile={tile}
							hexPath={hexPath}
							position={position}
							isHovered={isHovered}
							isSelected={isSelected}
							configurationMode={configurationMode}
							onTileClick={onTileClick ? (tile) => onTileClick(tile.id) : undefined}
							onTileRightClick={onTileRightClick ? (tile, event) => onTileRightClick(tile.id, event) : undefined}
							onTileHover={onTileHover ? (tile, event) => onTileHover(tile.id, event) : undefined}
							onMouseEnter={() => setHoveredTile(tile.id)}
							onMouseLeave={() => {
								setHoveredTile(null);
								onTileHoverEnd?.();
							}}
						/>
					);
				})}
			</StyledSVG>
		</MapContainer>
	);
});

HexagonalMapAdmin.displayName = 'HexagonalMapAdmin';

export default HexagonalMapAdmin;