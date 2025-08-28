'use client';

import React from 'react';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { Box, Typography, Paper } from '@mui/material';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface LandType {
	type: string;
	label: string;
	description: string;
}

const LegendContainer = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(3),
	display: 'flex',
	flexDirection: 'column',
	gap: theme.spacing(2),
	backgroundColor: alpha(theme.palette.background.paper, 0.6),
	backdropFilter: 'blur(8px)',
	boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
	borderRadius: theme.spacing(2),
	border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const LegendItem = styled(Box)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing(1.5),
	padding: theme.spacing(1),
	borderRadius: theme.spacing(1),
	transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
	'&:hover': {
		backgroundColor: alpha(theme.palette.action.hover, 0.04),
	}
}));

const ColorSwatch = styled(Box, {
	shouldForwardProp: (prop) => prop !== 'landType',
})<{ landType: string }>(({ theme, landType }) => {
	const isDark = theme.palette.mode === 'dark';
	
	// Enhanced color palette matching the updated HexagonalMap design
	const baseColors = {
		MARINE: isDark ? '#1e3a8a' : '#3b82f6', // Deep ocean blue (refined)
		PLAIN: isDark ? '#166534' : '#22c55e',   // Natural emerald green  
		COASTAL: isDark ? '#ea580c' : '#f97316'  // Warm coastal orange
	};
	
	const backgroundColor = baseColors[landType] || theme.palette.grey[isDark ? 700 : 300];
	
	return {
		width: 16,
		height: 16,
		backgroundColor: alpha(backgroundColor, isDark ? 0.6 : 0.8),
		border: `1px solid ${alpha(backgroundColor, isDark ? 0.3 : 0.4)}`,
		borderRadius: theme.spacing(0.5),
		flexShrink: 0,
		transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
		position: 'relative',
		'&::after': {
			content: '""',
			position: 'absolute',
			inset: 2,
			backgroundColor: alpha(backgroundColor, isDark ? 0.25 : 0.35),
			borderRadius: theme.spacing(0.25),
		}
	};
});

const MapLegend: React.FC = () => {
	const theme = useTheme();
	const { t } = useTranslation();
	
	const landTypes: LandType[] = [
		{
			type: 'MARINE',
			label: t('map.MARINE'),
			description: t('map.MARINE_DESCRIPTION')
		},
		{
			type: 'PLAIN',
			label: t('map.PLAIN'),
			description: t('map.PLAIN_DESCRIPTION')
		},
		{
			type: 'COASTAL',
			label: t('map.COASTAL'),
			description: t('map.COASTAL_DESCRIPTION')
		}
	];

	return (
		<LegendContainer elevation={0}>
			<Typography 
				variant="h6" 
				component="h3" 
				sx={{ 
					fontWeight: 500,
					fontSize: '1rem',
					color: 'text.primary',
					mb: 0.5
				}}
			>
				{t('map.TERRAIN_TYPES')}
			</Typography>
			{landTypes.map((landType) => (
				<LegendItem key={landType.type}>
					<ColorSwatch landType={landType.type} />
					<Box sx={{ minWidth: 0, flex: 1 }}>
						<Typography 
							variant="body2" 
							sx={{ 
								fontWeight: 500,
								fontSize: '0.875rem',
								color: 'text.primary',
								lineHeight: 1.3
							}}
						>
							{landType.label}
						</Typography>
						<Typography 
							variant="caption" 
							sx={{ 
								color: 'text.secondary',
								fontSize: '0.75rem',
								lineHeight: 1.2,
								display: 'block',
								mt: 0.25
							}}
						>
							{landType.description}
						</Typography>
					</Box>
				</LegendItem>
			))}
		</LegendContainer>
	);
};

export default MapLegend; 