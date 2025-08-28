import { Typography, Box, Paper } from '@mui/material';
import { MapTile } from '../types';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface MapStatisticsProps {
	tiles: MapTile[];
}

function MapStatistics({ tiles }: MapStatisticsProps) {
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

	// Calculate terrain statistics
	const terrainStats = tiles.reduce((acc, tile) => {
		acc[tile.landType] = (acc[tile.landType] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	return (
		<Paper 
			elevation={0}
			sx={{
				p: 3,
				borderRadius: 2,
				border: theme => `1px solid ${theme.palette.divider}`,
				backgroundColor: theme => theme.palette.mode === 'dark' 
					? 'rgba(255, 255, 255, 0.02)' 
					: 'rgba(255, 255, 255, 0.6)',
				backdropFilter: 'blur(8px)',
			}}
		>
			<Typography 
				variant="h6" 
				sx={{ 
					fontWeight: 500,
					fontSize: '1rem',
					color: 'text.primary',
					mb: 2.5
				}}
			>
				{t('map.STATISTICS')}
			</Typography>
			<div className="space-y-3">
				{Object.entries(terrainStats).map(([type, count]) => (
					<div key={type} className="flex justify-between items-center">
						<Typography 
							variant="body2" 
							sx={{ 
								fontSize: '0.875rem',
								color: 'text.secondary',
								textTransform: 'capitalize'
							}}
						>
							{getTerrainName(type)}
						</Typography>
						<Typography 
							variant="body2" 
							sx={{ 
								fontWeight: 500,
								fontSize: '0.875rem',
								color: 'text.primary'
							}}
						>
							{count}
						</Typography>
					</div>
				))}
			</div>
			<Box 
				sx={{ 
					mt: 3, 
					pt: 3, 
					borderTop: theme => `1px solid ${theme.palette.divider}`
				}}
			>
				<div className="flex justify-between items-center">
					<Typography 
						variant="body2" 
						sx={{ 
							fontWeight: 500,
							fontSize: '0.875rem',
							color: 'text.primary'
						}}
					>
						{t('map.TOTAL')}
					</Typography>
					<Typography 
						variant="body2" 
						sx={{ 
							fontWeight: 600,
							fontSize: '0.875rem',
							color: 'text.primary'
						}}
					>
						{tiles.length}
					</Typography>
				</div>
			</Box>
		</Paper>
	);
}

export default MapStatistics; 