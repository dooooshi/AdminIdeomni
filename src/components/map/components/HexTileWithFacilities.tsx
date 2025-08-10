import React from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography, Tooltip, Divider, Chip } from '@mui/material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import { HexTileProps } from '../types';
import LandTypeAnimations from './LandTypeAnimations';
import { StudentFacilityService } from '@/lib/services/studentFacilityService';
import type { TileFacilityInstance } from '@/types/facilities';

/**
 * Enhanced HexTile component with facility indicators
 */
interface HexTileWithFacilitiesProps extends HexTileProps {
	facilities?: TileFacilityInstance[];
	showFacilities?: boolean;
	onFacilityClick?: (facility: TileFacilityInstance) => void;
	onBuildFacilityClick?: (tileId: number) => void;
}

const HexTileWithFacilities: React.FC<HexTileWithFacilitiesProps> = ({
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
	hexSize = 28,
	facilities = [],
	showFacilities = true,
	onFacilityClick,
	onBuildFacilityClick
}) => {
	const theme = useTheme();
	const { t } = useTranslation('map');

	const tileFacilities = facilities.filter(f => f.tileId === tile.id);
	const hasActiveFacilities = tileFacilities.some(f => f.status === 'ACTIVE');
	const needsAttention = tileFacilities.some(f => StudentFacilityService.needsAttention(f));

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
		
		// Highlight tiles with facilities
		if (hasActiveFacilities) {
			return alpha(theme.palette.secondary.main, isDark ? 0.4 : 0.3);
		}
		
		return alpha(theme.palette.divider, isDark ? 0.08 : 0.15);
	};

	// Enhanced stroke styling for purchase states
	const getPurchaseStrokeColor = (isHovered: boolean = false, isSelected: boolean = false) => {
		const isDark = theme.palette.mode === 'dark';
		
		if (isSelected) {
			return theme.palette.primary.main;
		}
		
		// Highlight tiles with facilities that need attention
		if (needsAttention) {
			return isHovered 
				? theme.palette.warning.main 
				: alpha(theme.palette.warning.main, 0.7);
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

	// Enhanced fill color that considers purchase states and facilities
	const getPurchaseFillColor = (landType: string, isHovered: boolean = false) => {
		const baseColor = getLandTypeColor(landType, false);
		const isDark = theme.palette.mode === 'dark';
		
		// Enhance brightness for tiles with facilities
		if (hasActiveFacilities) {
			const facilitiesOpacity = isHovered ? (isDark ? 0.8 : 0.9) : (isDark ? 0.5 : 0.7);
			return alpha(baseColor, facilitiesOpacity);
		}
		
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

	// Facility indicators
	const renderFacilityIndicators = () => {
		if (!showFacilities || tileFacilities.length === 0) return null;
		
		const maxDisplayFacilities = 3; // Maximum facilities to show as icons
		const displayFacilities = tileFacilities.slice(0, maxDisplayFacilities);
		const additionalCount = tileFacilities.length - maxDisplayFacilities;
		
		return (
			<g>
				{displayFacilities.map((facility, index) => {
					const iconSize = 10;
					const spacing = 12;
					const startX = position.x - ((displayFacilities.length - 1) * spacing) / 2;
					const iconX = startX + (index * spacing);
					const iconY = position.y + 5;
					
					const facilityIcon = StudentFacilityService.getFacilityIcon(facility.facilityType);
					const statusColor = StudentFacilityService.getStatusColor(facility.status);
					const needsAttention = StudentFacilityService.needsAttention(facility);
					
					return (
						<g key={facility.id} transform={`translate(${iconX}, ${iconY})`}>
							{/* Background circle */}
							<circle
								cx={0}
								cy={0}
								r={8}
								fill={alpha(theme.palette.background.paper, 0.95)}
								stroke={needsAttention ? theme.palette.warning.main : theme.palette[statusColor].main}
								strokeWidth={needsAttention ? 2 : 1}
								style={{ cursor: 'pointer' }}
								onClick={(e) => {
									e.stopPropagation();
									onFacilityClick?.(facility);
								}}
							/>
							
							{/* Facility icon */}
							<text
								x={0}
								y={1}
								textAnchor="middle"
								fontSize={8}
								fill={theme.palette.text.primary}
								style={{ 
									cursor: 'pointer',
									userSelect: 'none',
									pointerEvents: 'none'
								}}
							>
								{facilityIcon}
							</text>
							
							{/* Level indicator */}
							{facility.level > 1 && (
								<circle
									cx={6}
									cy={-6}
									r={4}
									fill={theme.palette.primary.main}
									stroke={theme.palette.common.white}
									strokeWidth={1}
								/>
							)}
							{facility.level > 1 && (
								<text
									x={6}
									y={-4}
									textAnchor="middle"
									fontSize={6}
									fill={theme.palette.common.white}
									fontWeight="bold"
									style={{ pointerEvents: 'none' }}
								>
									{facility.level}
								</text>
							)}
							
							{/* Attention indicator */}
							{needsAttention && (
								<circle
									cx={-6}
									cy={-6}
									r={3}
									fill={theme.palette.warning.main}
									stroke={theme.palette.common.white}
									strokeWidth={1}
								/>
							)}
						</g>
					);
				})}
				
				{/* Additional facilities count */}
				{additionalCount > 0 && (
					<g transform={`translate(${position.x + 20}, ${position.y + 5})`}>
						<circle
							cx={0}
							cy={0}
							r={6}
							fill={alpha(theme.palette.info.main, 0.8)}
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
							+{additionalCount}
						</text>
					</g>
				)}
			</g>
		);
	};

	// Purchase indicator icon overlay
	const renderPurchaseIndicator = () => {
		if (!tile.canPurchase && !tile.isOwned) return null;
		
		const iconSize = 12;
		const iconX = position.x + 15;
		const iconY = position.y - 15; // Moved up to avoid conflict with facility indicators
		
		
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

	// Enhanced tooltip with facility information
	const renderTooltipContent = () => (
		<Box sx={{ py: 1, px: 0.5, minWidth: 220 }}>
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
				{/* Basic tile information */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
						{t('TILE_ID')}:
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem', fontWeight: 600 }}>
						{tile.id}
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
						{t('POSITION')}:
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace' }}>
						({tile.axialQ}, {tile.axialR})
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
						{t('TERRAIN')}:
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
						{getTerrainName(tile.landType)}
					</Typography>
				</Box>

				{/* Facility Information */}
				{showFacilities && tileFacilities.length > 0 && (
					<>
						<Divider sx={{ mx: -0.5, my: 1 }} />
						<Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.75rem', fontWeight: 600 }}>
							Facilities ({tileFacilities.length})
						</Typography>
						
						{tileFacilities.slice(0, 3).map((facility) => (
							<Box key={facility.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ml: 1 }}>
								<Box display="flex" alignItems="center" gap={0.5}>
									<Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
										{StudentFacilityService.getFacilityIcon(facility.facilityType)}
									</Typography>
									<Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.7rem' }}>
										{StudentFacilityService.getFacilityTypeName(facility.facilityType)}
									</Typography>
								</Box>
								<Box display="flex" alignItems="center" gap={0.5}>
									<Chip
										label={`L${facility.level}`}
										size="small"
										sx={{ 
											height: 16, 
											fontSize: '0.6rem',
											'& .MuiChip-label': { px: 0.5 }
										}}
									/>
									<Chip
										label={StudentFacilityService.getStatusText(facility.status)}
										size="small"
										color={StudentFacilityService.getStatusColor(facility.status) as any}
										variant="outlined"
										sx={{ 
											height: 16, 
											fontSize: '0.6rem',
											'& .MuiChip-label': { px: 0.5 }
										}}
									/>
								</Box>
							</Box>
						))}
						
						{tileFacilities.length > 3 && (
							<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', ml: 1 }}>
								... and {tileFacilities.length - 3} more
							</Typography>
						)}
						
						{/* Build facility hint for owned tiles */}
						{tile.isOwned && (
							<Box sx={{ 
								mt: 1, 
								p: 0.5, 
								bgcolor: alpha(theme.palette.primary.main, 0.1),
								borderRadius: 1,
								border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
							}}>
								<Typography 
									variant="caption" 
									sx={{ 
										color: 'primary.main',
										fontSize: '0.65rem',
										fontWeight: 500,
										display: 'block',
										textAlign: 'center'
									}}
								>
									🏗️ Click to build facility
								</Typography>
							</Box>
						)}
					</>
				)}

				{/* Existing economic and purchase information */}
				{/* ... (rest of the original tooltip content) ... */}
			</Box>
		</Box>
	);

	return (
		<Tooltip
			title={renderTooltipContent()}
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
						maxWidth: 300,
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
					strokeWidth={isSelected ? 3 : isHovered ? 2 : (tile.canPurchase || hasActiveFacilities ? 1.5 : 0.5)}
					style={{
						cursor: onTileClick ? 'pointer' : 'default',
						transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
						transformOrigin: `${position.x}px ${position.y}px`,
						transform: isSelected ? 'scale(1.08)' : isHovered ? 'scale(1.05)' : 'scale(1)',
						filter: !tile.isActive ? 'grayscale(0.3)' : 'none',
					}}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					onMouseMove={(e) => onTileHover?.(tile, e)}
					onClick={() => {
						if (tile.isOwned && tileFacilities.length === 0) {
							onBuildFacilityClick?.(tile.id);
						} else {
							onTileClick?.(tile);
						}
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
				{renderFacilityIndicators()}
			</g>
		</Tooltip>
	);
};

export default HexTileWithFacilities;