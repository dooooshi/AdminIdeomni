import React from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { HexTileProps } from '../types';

/**
 * HexTile component - Renders an individual hexagonal tile with tooltip
 */
const HexTile: React.FC<HexTileProps> = ({
	tile,
	hexPath,
	position,
	isHovered,
	onTileClick,
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
	const getStrokeColor = (isHovered: boolean = false, isActive: boolean = true) => {
		const isDark = theme.palette.mode === 'dark';
		
		if (isHovered) {
			return alpha(theme.palette.primary.main, isDark ? 0.7 : 0.8);
		}
		
		if (!isActive) {
			return alpha(theme.palette.divider, isDark ? 0.2 : 0.25);
		}
		
		return alpha(theme.palette.divider, isDark ? 0.08 : 0.15);
	};

	return (
		<Tooltip
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
						{t('SELECTED_TILE_INFO')}
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
								{t('POSITION')}:
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
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<Typography 
								variant="caption" 
								sx={{ 
									color: 'text.secondary',
									fontSize: '0.75rem',
									fontWeight: 500
								}}
							>
								{t('STATUS')}:
							</Typography>
							<Typography 
								variant="caption" 
								sx={{ 
									color: tile.isActive ? 'success.main' : 'error.main',
									fontSize: '0.75rem',
									fontWeight: 600
								}}
							>
								{tile.isActive ? t('ACTIVE') : t('INACTIVE')}
							</Typography>
						</Box>
					</Box>
				</Box>
			}
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
			<path
				d={hexPath}
				fill={getLandTypeColor(tile.landType, isHovered)}
				stroke={getStrokeColor(isHovered, tile.isActive)}
				strokeWidth={isHovered ? 1.5 : 0.5}
				style={{
					cursor: onTileClick ? 'pointer' : 'default',
					transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
					transformOrigin: `${position.x}px ${position.y}px`,
					transform: isHovered ? 'scale(1.05)' : 'scale(1)',
					filter: !tile.isActive ? 'grayscale(0.3)' : 'none',
				}}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				onClick={() => onTileClick?.(tile)}
			/>
		</Tooltip>
	);
};

export default HexTile; 