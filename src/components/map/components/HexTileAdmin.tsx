import React from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { HexTileProps } from '../types';
import { safeCurrencyFormat, safeToLocaleString, isValidNumber } from '../utils/formatUtils';

/**
 * HexTileAdmin component - Admin-focused hexagonal tile for configuration
 * 
 * This is a specialized version of HexTile designed for administrative
 * configuration tasks. It excludes animations and focuses on configuration
 * feedback and administrative data display.
 * 
 * Features:
 * - No land type animations 
 * - Enhanced configuration mode styling
 * - Administrative tooltip information
 * - Better selection feedback for config mode
 * - Performance optimized for large template editing
 */
const HexTileAdmin: React.FC<Omit<HexTileProps, 'allTiles' | 'hexSize'>> = ({
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
	onMouseLeave
}) => {
	const theme = useTheme();
	const { t } = useTranslation('map');

	// Helper function to get translated terrain name
	const getTerrainName = (landType: string): string => {
		switch (landType) {
			case 'MARINE':
				return t('TERRAIN_MARINE');
			case 'PLAIN':
				return t('TERRAIN_PLAIN');
			case 'COASTAL':
				return t('TERRAIN_COASTAL');
			default:
				return landType.toLowerCase();
		}
	};

	// Administrative color palette - more subtle for configuration
	const getLandTypeColor = (landType: string, isHovered: boolean = false) => {
		const isDark = theme.palette.mode === 'dark';
		
		// Admin-focused color palette with better contrast for configuration
		const baseColors = {
			MARINE: isDark ? '#1565C0' : '#1976D2', // Material Blue
			PLAIN: isDark ? '#2E7D32' : '#388E3C',   // Material Green  
			COASTAL: isDark ? '#F57C00' : '#FF9800'  // Material Orange
		};

		const color = baseColors[landType] || theme.palette.grey[isDark ? 600 : 400];
		
		// Enhanced opacity for admin configuration
		if (isHovered) {
			return alpha(color, isDark ? 0.85 : 0.75);
		}
		
		return alpha(color, isDark ? 0.4 : 0.5);
	};

	// Admin-specific stroke styling with configuration focus
	const getStrokeColor = (isHovered: boolean = false, isSelected: boolean = false, isActive: boolean = true) => {
		const isDark = theme.palette.mode === 'dark';
		
		if (isSelected) {
			// Stronger selection color for configuration mode
			return theme.palette.primary.main;
		}
		
		if (isHovered) {
			return alpha(theme.palette.primary.main, isDark ? 0.8 : 0.9);
		}
		
		if (!isActive) {
			return alpha(theme.palette.divider, isDark ? 0.3 : 0.4);
		}
		
		// Default admin border - more visible than user version
		return alpha(theme.palette.divider, isDark ? 0.15 : 0.25);
	};

	// Configuration mode indicator
	const renderConfigurationIndicator = () => {
		if (!configurationMode) return null;
		
		const iconSize = 8;
		const iconX = position.x + 18;
		const iconY = position.y - 12;
		
		// Configuration mode indicator
		return (
			<g transform={`translate(${iconX}, ${iconY})`}>
				<circle
					cx={0}
					cy={0}
					r={6}
					fill={alpha(theme.palette.secondary.main, 0.8)}
					stroke={theme.palette.common.white}
					strokeWidth={1}
				/>
				<text
					x={0}
					y={1}
					textAnchor="middle"
					fontSize={6}
					fill={theme.palette.common.white}
					fontWeight="bold"
				>
					⚙
				</text>
			</g>
		);
	};

	// Administrative tooltip with enhanced configuration information
	const renderTooltip = () => (
		<Box sx={{ py: 1, px: 0.5, minWidth: 220 }}>
			<Typography 
				variant="subtitle2" 
				component="div"
				sx={{ 
					fontWeight: 600,
					color: 'primary.main',
					mb: 1,
					fontSize: '0.875rem'
				}}
			>
				🔧 {t('ADMIN_TILE_CONFIG')}
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
						{t('TILE_ID')}:
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
						{t('COORDINATES')}:
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
						{t('TERRAIN')}:
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

				{/* Configuration-specific information */}
				{isValidNumber(tile.initialGoldPrice) && (
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Typography 
							variant="caption" 
							sx={{ 
								color: 'text.secondary',
								fontSize: '0.75rem',
								fontWeight: 500
							}}
						>
							{t('INITIAL_GOLD_PRICE')}:
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
							{safeCurrencyFormat(tile.initialGoldPrice)}
						</Typography>
					</Box>
				)}

				{isValidNumber(tile.initialCarbonPrice) && (
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Typography 
							variant="caption" 
							sx={{ 
								color: 'text.secondary',
								fontSize: '0.75rem',
								fontWeight: 500
							}}
						>
							{t('INITIAL_CARBON_PRICE')}:
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
							{safeCurrencyFormat(tile.initialCarbonPrice)}
						</Typography>
					</Box>
				)}

				{isValidNumber(tile.initialPopulation) && (
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Typography 
							variant="caption" 
							sx={{ 
								color: 'text.secondary',
								fontSize: '0.75rem',
								fontWeight: 500
							}}
						>
							{t('INITIAL_POPULATION')}:
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
							{safeToLocaleString(tile.initialPopulation)}
						</Typography>
					</Box>
				)}

				{configurationMode && (
					<>
						<Box sx={{ 
							height: '1px', 
							bgcolor: 'divider', 
							mx: -0.5, 
							my: 1 
						}} />
						
						<Box sx={{ 
							mt: 1, 
							p: 1, 
							bgcolor: alpha(theme.palette.primary.main, 0.1),
							borderRadius: 1,
							border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
						}}>
							<Typography 
								variant="caption" 
								sx={{ 
									color: 'primary.main',
									fontSize: '0.7rem',
									fontWeight: 500,
									display: 'block',
									textAlign: 'center'
								}}
							>
								🖱️ {t('CLICK_TO_CONFIGURE')}
							</Typography>
						</Box>
					</>
				)}
			</Box>
		</Box>
	);

	return (
		<Tooltip
			title={renderTooltip()}
			arrow
			placement="top"
			componentsProps={{
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
					fill={getLandTypeColor(tile.landType, isHovered)}
					stroke={getStrokeColor(isHovered, isSelected)}
					strokeWidth={isSelected ? 4 : isHovered ? 2.5 : (configurationMode ? 1.5 : 1)}
					style={{
						cursor: onTileClick ? 'pointer' : 'default',
						transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
						transformOrigin: `${position.x}px ${position.y}px`,
						transform: isSelected ? 'scale(1.1)' : isHovered ? 'scale(1.06)' : 'scale(1)',
						filter: !tile.isActive ? 'grayscale(0.4)' : 'none',
					}}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					onMouseMove={(e) => onTileHover?.(tile, e)}
					onClick={() => onTileClick?.(tile)}
					onContextMenu={(e) => {
						e.preventDefault();
						onTileRightClick?.(tile, e);
					}}
				/>
				
				{/* Configuration mode indicator - NO ANIMATIONS */}
				{renderConfigurationIndicator()}
			</g>
		</Tooltip>
	);
};

export default HexTileAdmin;