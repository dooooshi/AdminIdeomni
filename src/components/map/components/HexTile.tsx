import React, { useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography, Tooltip } from '@mui/material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { HexTileProps } from '../types';
import LandTypeAnimations from './LandTypeAnimations';

/**
 * HexTile component - Renders an individual hexagonal tile with tooltip
 */
const HexTile: React.FC<HexTileProps> = ({
	tile,
	hexPath,
	position,
	isHovered,
	isSelected = false,
	configurationMode = false,
	onTileClick,
	onTileRightClick,
	onTileHover,
	onMouseEnter,
	onMouseLeave,
	allTiles = [],
	hexSize = 28
}) => {
	const theme = useTheme();
	const { t } = useTranslation();

	// Helper function to get translated terrain name
	const getTerrainName = (landType: string): string => {
		switch (landType) {
			case 'MARINE':
				return t('map.TERRAIN_MARINE');
			case 'PLAIN':
				return t('map.TERRAIN_PLAIN');
			case 'COASTAL':
				return t('map.TERRAIN_COASTAL');
			default:
				return landType.toLowerCase();
		}
	};

	// Enhanced color palette matching project's sophisticated design system
	const getLandTypeColor = (landType: string, isHovered: boolean = false) => {
		const isDark = theme.palette.mode === 'dark';
		
		// Refined color palette using project's design tokens
		const baseColors = {
			MARINE: isDark ? '#1e3a8a' : '#3b82f6', // Deep ocean blue (refined)
			PLAIN: isDark ? '#166534' : '#22c55e',   // Natural emerald green  
			COASTAL: isDark ? '#ea580c' : '#f97316'  // Warm coastal orange
		};

		const color = baseColors[landType] || theme.palette.grey[isDark ? 700 : 300];
		
		// Enhanced opacity system for better visual hierarchy
		if (isHovered) {
			return alpha(color, isDark ? 0.8 : 0.9);
		}
		
		return alpha(color, isDark ? 0.35 : 0.55);
	};

	// Enhanced stroke styling with sophisticated color transitions
	const getStrokeColor = (isHovered: boolean = false, isSelected: boolean = false, isActive: boolean = true) => {
		const isDark = theme.palette.mode === 'dark';
		
		if (isSelected) {
			return theme.palette.primary.main;
		}
		
		if (isHovered) {
			return alpha(theme.palette.primary.main, isDark ? 0.7 : 0.8);
		}
		
		if (!isActive) {
			return alpha(theme.palette.divider, isDark ? 0.2 : 0.25);
		}
		
		return alpha(theme.palette.divider, isDark ? 0.08 : 0.15);
	};

	// Enhanced stroke styling for purchase states
	const getPurchaseStrokeColor = (isHovered: boolean = false, isSelected: boolean = false) => {
		const isDark = theme.palette.mode === 'dark';
		
		if (isSelected) {
			return theme.palette.primary.main;
		}
		
		// Purchase state indicators
		if (tile.canPurchase) {
			return isHovered 
				? theme.palette.success.main 
				: alpha(theme.palette.success.main, 0.7);
		}
		
		if (tile.isOwned) {
			return isHovered 
				? theme.palette.primary.main 
				: alpha(theme.palette.primary.main, 0.6);
		}
		
		// Default for unavailable tiles
		if (isHovered) {
			return alpha(theme.palette.divider, isDark ? 0.6 : 0.4);
		}
		
		return alpha(theme.palette.divider, isDark ? 0.08 : 0.15);
	};

	// Enhanced fill color that considers purchase states
	const getPurchaseFillColor = (landType: string, isHovered: boolean = false) => {
		const baseColor = getLandTypeColor(landType, false);
		const isDark = theme.palette.mode === 'dark';
		
		// Enhance brightness for purchasable tiles
		if (tile.canPurchase) {
			const enhancedOpacity = isHovered ? (isDark ? 0.9 : 1.0) : (isDark ? 0.6 : 0.75);
			return alpha(baseColor, enhancedOpacity);
		}
		
		// Dim owned tiles slightly
		if (tile.isOwned) {
			const ownedOpacity = isHovered ? (isDark ? 0.7 : 0.8) : (isDark ? 0.4 : 0.6);
			return alpha(baseColor, ownedOpacity);
		}
		
		// Significantly dim unavailable tiles
		const unavailableOpacity = isHovered ? (isDark ? 0.3 : 0.4) : (isDark ? 0.15 : 0.25);
		return alpha(baseColor, unavailableOpacity);
	};

	// Purchase indicator icon overlay
	const renderPurchaseIndicator = () => {
		if (!tile.canPurchase && !tile.isOwned) return null;
		
		const iconSize = 12;
		const iconX = position.x + 15;
		const iconY = position.y - 8;
		
		
		if (tile.isOwned) {
			// Checkmark for owned tiles  
			return (
				<g transform={`translate(${iconX}, ${iconY})`}>
					<circle
						cx={0}
						cy={0}
						r={8}
						fill={alpha(theme.palette.primary.main, 0.9)}
						stroke={theme.palette.common.white}
						strokeWidth={1}
					/>
					<text
						x={0}
						y={1}
						textAnchor="middle"
						fontSize={8}
						fill={theme.palette.common.white}
						fontWeight="bold"
					>
						✓
					</text>
				</g>
			);
		}
		
		return null;
	};

	// State for controlling tooltip
	const [tooltipOpen, setTooltipOpen] = useState(false);

	const handleTooltipClose = () => {
		setTooltipOpen(false);
	};

	const handleTooltipOpen = () => {
		setTooltipOpen(true);
	};

	const handlePurchaseClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		if (onTileClick && tile.canPurchase && tile.landType !== 'MARINE') {
			onTileClick(tile);
			handleTooltipClose();
		}
	};

	return (
		<Tooltip
			open={isHovered || tooltipOpen}
			onOpen={handleTooltipOpen}
			onClose={handleTooltipClose}
			title={
				<Box sx={{ py: 1, px: 0.5, minWidth: 200 }}>
					<Typography 
						variant="subtitle2" 
						component="div"
						sx={{ 
							fontWeight: 600,
							color: 'text.primary',
							mb: 1,
							fontSize: '0.875rem'
						}}
					>
						{t('map.SELECTED_TILE_INFO')}
					</Typography>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<Typography 
								variant="caption" 
								sx={{ 
									color: 'text.secondary',
									fontSize: '0.75rem',
									fontWeight: 500
								}}
							>
								{t('map.TILE_ID')}:
							</Typography>
							<Typography 
								variant="caption" 
								sx={{ 
									color: 'text.primary',
									fontSize: '0.75rem',
									fontWeight: 600
								}}
							>
								{tile.id}
							</Typography>
						</Box>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<Typography 
								variant="caption" 
								sx={{ 
									color: 'text.secondary',
									fontSize: '0.75rem',
									fontWeight: 500
								}}
							>
								{t('map.POSITION')}:
							</Typography>
							<Typography 
								variant="caption" 
								sx={{ 
									color: 'text.primary',
									fontSize: '0.75rem',
									fontWeight: 600,
									fontFamily: 'monospace'
								}}
							>
								({tile.axialQ}, {tile.axialR})
							</Typography>
						</Box>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<Typography 
								variant="caption" 
								sx={{ 
									color: 'text.secondary',
									fontSize: '0.75rem',
									fontWeight: 500
								}}
							>
								{t('map.TERRAIN')}:
							</Typography>
							<Typography 
								variant="caption" 
								sx={{ 
									color: 'text.primary',
									fontSize: '0.75rem',
									fontWeight: 600,
									textTransform: 'capitalize'
								}}
							>
								{getTerrainName(tile.landType)}
							</Typography>
						</Box>
						{/* Economic Data Display */}
						{tile.currentGoldPrice !== undefined && tile.currentGoldPrice !== null && typeof tile.currentGoldPrice === 'number' && (
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography 
									variant="caption" 
									sx={{ 
										color: 'text.secondary',
										fontSize: '0.75rem',
										fontWeight: 500
									}}
								>
									{t('map.CURRENT_GOLD_PRICE')}:
								</Typography>
								<Typography 
									variant="caption" 
									sx={{ 
										color: 'warning.main',
										fontSize: '0.75rem',
										fontWeight: 600,
										fontFamily: 'monospace'
									}}
								>
									${Number(tile.currentGoldPrice).toFixed(2)}
								</Typography>
							</Box>
						)}

						{tile.currentCarbonPrice !== undefined && tile.currentCarbonPrice !== null && typeof tile.currentCarbonPrice === 'number' && (
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography 
									variant="caption" 
									sx={{ 
										color: 'text.secondary',
										fontSize: '0.75rem',
										fontWeight: 500
									}}
								>
									{t('map.CURRENT_CARBON_PRICE')}:
								</Typography>
								<Typography 
									variant="caption" 
									sx={{ 
										color: 'success.main',
										fontSize: '0.75rem',
										fontWeight: 600,
										fontFamily: 'monospace'
									}}
								>
									${Number(tile.currentCarbonPrice).toFixed(2)}
								</Typography>
							</Box>
						)}

						{tile.currentPopulation !== undefined && tile.currentPopulation !== null && typeof tile.currentPopulation === 'number' && (
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography 
									variant="caption" 
									sx={{ 
										color: 'text.secondary',
										fontSize: '0.75rem',
										fontWeight: 500
									}}
								>
									{t('map.CURRENT_POPULATION')}:
								</Typography>
								<Typography 
									variant="caption" 
									sx={{ 
										color: 'info.main',
										fontSize: '0.75rem',
										fontWeight: 600,
										fontFamily: 'monospace'
									}}
								>
									{Number(tile.currentPopulation).toLocaleString()}
								</Typography>
							</Box>
						)}

						{tile.isModified && (
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography 
									variant="caption" 
									sx={{ 
										color: 'text.secondary',
										fontSize: '0.75rem',
										fontWeight: 500
									}}
								>
									{t('map.STATUS')}:
								</Typography>
								<Typography 
									variant="caption" 
									sx={{ 
										color: 'warning.main',
										fontSize: '0.75rem',
										fontWeight: 600
									}}
								>
									{t('map.MODIFIED')}
								</Typography>
							</Box>
						)}

						{/* Purchase Information Section */}
						{(tile.canPurchase || tile.isOwned || tile.availableArea !== undefined) && (
							<>
								<Box sx={{ 
									height: '1px', 
									bgcolor: 'divider', 
									mx: -0.5, 
									my: 1 
								}} />
								
								{/* Purchase Status */}
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<Typography 
										variant="caption" 
										sx={{ 
											color: 'text.secondary',
											fontSize: '0.75rem',
											fontWeight: 500
										}}
									>
										{t('map.PURCHASE_STATUS')}:
									</Typography>
									<Typography 
										variant="caption" 
										sx={{ 
											color: tile.canPurchase ? 'success.main' : tile.isOwned ? 'primary.main' : 'error.main',
											fontSize: '0.75rem',
											fontWeight: 600
										}}
									>
										{tile.isOwned ? t('map.OWNED_BY_TEAM') : tile.canPurchase ? t('map.AVAILABLE_FOR_PURCHASE') : t('map.UNAVAILABLE')}
									</Typography>
								</Box>

								{/* Available Area */}
								{tile.availableArea !== undefined && tile.availableArea !== null && typeof tile.availableArea === 'number' && (
									<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
										<Typography 
											variant="caption" 
											sx={{ 
												color: 'text.secondary',
												fontSize: '0.75rem',
												fontWeight: 500
											}}
										>
											{t('map.AVAILABLE_AREA')}:
										</Typography>
										<Typography 
											variant="caption" 
											sx={{ 
												color: 'text.primary',
												fontSize: '0.75rem',
												fontWeight: 600,
												fontFamily: 'monospace'
											}}
										>
											{Number(tile.availableArea).toFixed(1)} {t('map.AREA_UNITS')}
										</Typography>
									</Box>
								)}

								{/* Total Cost */}
								{tile.canPurchase && tile.totalCost !== undefined && tile.totalCost !== null && typeof tile.totalCost === 'number' && (
									<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
										<Typography 
											variant="caption" 
											sx={{ 
												color: 'text.secondary',
												fontSize: '0.75rem',
												fontWeight: 500
											}}
										>
											{t('map.COST_PER_UNIT')}:
										</Typography>
										<Typography 
											variant="caption" 
											sx={{ 
												color: 'warning.main',
												fontSize: '0.75rem',
												fontWeight: 600,
												fontFamily: 'monospace'
											}}
										>
											${Number(tile.totalCost).toFixed(2)}
										</Typography>
									</Box>
								)}

								{/* Purchase Action Button - Click here or tile to purchase */}
								{tile.canPurchase && tile.landType !== 'MARINE' && (
									<Box
										sx={{
											mt: 1,
											p: 1,
											bgcolor: alpha(theme.palette.success.main, 0.1),
											borderRadius: 1,
											border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
											cursor: 'pointer',
											transition: 'all 0.2s',
											'&:hover': {
												bgcolor: alpha(theme.palette.success.main, 0.2),
												borderColor: alpha(theme.palette.success.main, 0.4)
											}
										}}
										onClick={handlePurchaseClick}
									>
										<Typography
											variant="caption"
											sx={{
												color: 'success.main',
												fontSize: '0.7rem',
												fontWeight: 500,
												display: 'block',
												textAlign: 'center'
											}}
										>
											💡 {t('map.CLICK_TO_PURCHASE_HINT')}
										</Typography>
									</Box>
								)}
								{/* Marine tile notice */}
								{tile.canPurchase && tile.landType === 'MARINE' && (
									<Box sx={{
										mt: 1,
										p: 1,
										bgcolor: alpha(theme.palette.info.main, 0.1),
										borderRadius: 1,
										border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
									}}>
										<Typography
											variant="caption"
											sx={{
												color: 'info.main',
												fontSize: '0.7rem',
												fontWeight: 500,
												display: 'block',
												textAlign: 'center'
											}}
										>
											ℹ️ {t('map.MARINE_TILES_NOT_PURCHASABLE')}
										</Typography>
									</Box>
								)}
							</>
						)}

					</Box>
				</Box>
			}
			arrow
			placement="top"
			slotProps={{
				tooltip: {
					sx: {
						bgcolor: alpha(theme.palette.background.paper, 0.95),
						border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
						borderRadius: 2,
						backdropFilter: 'blur(12px)',
						boxShadow: theme => `0 4px 12px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.4 : 0.15)}`,
						maxWidth: 280,
					}
				},
				arrow: {
					sx: {
						color: alpha(theme.palette.background.paper, 0.95),
					}
				}
			}}
		>
			<g>
				<path
					d={hexPath}
					fill={getPurchaseFillColor(tile.landType, isHovered)}
					stroke={getPurchaseStrokeColor(isHovered, isSelected)}
					strokeWidth={isSelected ? 3 : isHovered ? 2 : (tile.canPurchase ? 1.5 : 0.5)}
					style={{
						cursor: onTileClick ? 'pointer' : 'default',
						transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
						transformOrigin: `${position.x}px ${position.y}px`,
						transform: isSelected ? 'scale(1.08)' : isHovered ? 'scale(1.05)' : 'scale(1)',
						filter: !tile.isActive ? 'grayscale(0.3)' : 'none',
					}}
					onMouseEnter={() => {
						onMouseEnter();
						handleTooltipOpen();
					}}
					onMouseLeave={() => {
						onMouseLeave();
						// Don't close tooltip immediately to allow interaction
						setTimeout(() => {
							if (!tooltipOpen) {
								handleTooltipClose();
							}
						}, 100);
					}}
					onMouseMove={(e) => onTileHover?.(tile, e)}
					onClick={() => {
						// Always trigger tile click - the parent component handles purchase logic
						onTileClick?.(tile);
					}}
					onContextMenu={(e) => {
						e.preventDefault();
						onTileRightClick?.(tile, e);
					}}
				/>
				
				{/* Land type animations for business-sense connections */}
				{allTiles.length > 0 && (
					<LandTypeAnimations
						tile={tile}
						allTiles={allTiles}
						position={position}
						hexSize={hexSize}
					/>
				)}
				
				{renderPurchaseIndicator()}
			</g>
		</Tooltip>
	);
};

export default HexTile; 