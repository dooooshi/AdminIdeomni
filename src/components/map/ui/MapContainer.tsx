/**
 * MapContainer Component - Container for the interactive map with zoom controls
 * 
 * This component provides:
 * - Zoom in/out/reset buttons with visual feedback
 * - Real-time zoom level display (percentage)
 * - Proper disabled states for zoom limits
 * - Integration with HexagonalMap's zoom functionality
 * 
 * Usage:
 * - Click zoom buttons or use mouse wheel on map
 * - Keyboard shortcuts: Ctrl/Cmd + [+/-/0]
 * - Drag to pan when zoomed in
 */

import { Typography, Button, Box, Paper, IconButton, Tooltip } from '@mui/material';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import HexagonalMap from '../components/HexagonalMap';
import { MapTile } from '../types';
import { useTranslation } from '@/@i18n/hooks/useTranslation';
import { useState, useRef } from 'react';

interface HexagonalMapRef {
	zoomIn: () => void;
	zoomOut: () => void;
	resetZoom: () => void;
}

interface MapContainerProps {
	tiles: MapTile[];
	onTileClick: (tile: MapTile) => void;
	onExpand?: () => void;
}

function MapContainer({ tiles, onTileClick, onExpand }: MapContainerProps) {
	const { t } = useTranslation('map');
	const [zoomLevel, setZoomLevel] = useState(1);
	const mapRef = useRef<HexagonalMapRef>(null);

	const handleZoomIn = () => {
		mapRef.current?.zoomIn();
	};

	const handleZoomOut = () => {
		mapRef.current?.zoomOut();
	};

	const handleResetZoom = () => {
		mapRef.current?.resetZoom();
	};

	const handleZoomChange = (newZoomLevel: number) => {
		setZoomLevel(newZoomLevel);
	};
	
	return (
		<Paper 
			elevation={0}
			sx={{
				p: 4,
				borderRadius: 3,
				border: theme => `1px solid ${theme.palette.divider}`,
				backgroundColor: theme => theme.palette.mode === 'dark' 
					? 'rgba(255, 255, 255, 0.02)' 
					: 'rgba(255, 255, 255, 0.8)',
				backdropFilter: 'blur(8px)',
				overflow: 'hidden'
			}}
		>
			<div className="flex items-center justify-between mb-6">
				<div>
					<Typography 
						variant="h6"
						sx={{ 
							fontWeight: 500,
							fontSize: '1.1rem',
							color: 'text.primary',
							mb: 0.5
						}}
					>
						{t('INTERACTIVE_MAP')}
					</Typography>
					<Typography 
						variant="body2" 
						sx={{ 
							color: 'text.secondary',
							fontSize: '0.85rem'
						}}
					>
						{tiles.length} {t('TILES_COUNT')} • {t('GRID_SIZE')} • {t('ZOOM_LEVEL')}: {Math.round(zoomLevel * 100)}%
					</Typography>
				</div>
				<div className="flex items-center space-x-2">
					{/* Zoom Controls */}
					<div className="flex items-center space-x-1 bg-opacity-30 rounded-lg p-1" 
						style={{ 
							backgroundColor: 'rgba(0, 0, 0, 0.04)',
							border: '1px solid rgba(0, 0, 0, 0.08)'
						}}
					>
						<Tooltip title={t('ZOOM_OUT')} arrow placement="top">
							<IconButton
								size="small"
								onClick={handleZoomOut}
								disabled={zoomLevel <= 0.5}
								sx={{ 
									color: 'text.secondary',
									'&:hover': {
										color: 'primary.main',
										backgroundColor: 'transparent'
									},
									'&:disabled': {
										color: 'text.disabled'
									}
								}}
							>
								<IdeomniSvgIcon size={16}>heroicons-solid:magnifying-glass-minus</IdeomniSvgIcon>
							</IconButton>
						</Tooltip>
						
						<Tooltip title={t('RESET_ZOOM')} arrow placement="top">
							<IconButton
								size="small"
								onClick={handleResetZoom}
								disabled={zoomLevel === 1}
								sx={{ 
									color: 'text.secondary',
									'&:hover': {
										color: 'primary.main',
										backgroundColor: 'transparent'
									},
									'&:disabled': {
										color: 'text.disabled'
									}
								}}
							>
								<IdeomniSvgIcon size={16}>heroicons-solid:arrows-pointing-out</IdeomniSvgIcon>
							</IconButton>
						</Tooltip>

						<Tooltip title={t('ZOOM_IN')} arrow placement="top">
							<IconButton
								size="small"
								onClick={handleZoomIn}
								disabled={zoomLevel >= 3}
								sx={{ 
									color: 'text.secondary',
									'&:hover': {
										color: 'primary.main',
										backgroundColor: 'transparent'
									},
									'&:disabled': {
										color: 'text.disabled'
									}
								}}
							>
								<IdeomniSvgIcon size={16}>heroicons-solid:magnifying-glass-plus</IdeomniSvgIcon>
							</IconButton>
						</Tooltip>
					</div>

					{/* Expand Button */}

				</div>
			</div>
			<Box sx={{ height: 600, width: '100%' }}>
				<HexagonalMap
					ref={mapRef}
					tiles={tiles}
					onTileClick={onTileClick}
					zoomLevel={zoomLevel}
					onZoomChange={handleZoomChange}
				/>
			</Box>
		</Paper>
	);
}

export default MapContainer; 