import { Typography, Paper } from '@mui/material';
import { MapTile } from '../types';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface SelectedTileInfoProps {
	selectedTile: MapTile | null;
}

function SelectedTileInfo({ selectedTile }: SelectedTileInfoProps) {
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

	if (!selectedTile) {
		return null;
	}

	return (
		<Paper 
			elevation={0}
			sx={{
				p: 3,
				borderRadius: 2,
				border: theme => `1px solid ${theme.palette.primary.main}`,
				backgroundColor: theme => theme.palette.mode === 'dark' 
					? 'rgba(37, 47, 62, 0.1)' 
					: 'rgba(37, 47, 62, 0.02)',
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
				{t('SELECTED_TILE')}
			</Typography>
			<div className="space-y-3">
				<div className="flex justify-between">
					<Typography 
						variant="body2"
						sx={{ 
							fontSize: '0.875rem',
							color: 'text.secondary'
						}}
					>
						{t('TILE_ID_SHORT')}:
					</Typography>
					<Typography 
						variant="body2" 
						sx={{ 
							fontWeight: 500,
							fontSize: '0.875rem',
							color: 'text.primary'
						}}
					>
						{selectedTile.id}
					</Typography>
				</div>
				<div className="flex justify-between">
					<Typography 
						variant="body2"
						sx={{ 
							fontSize: '0.875rem',
							color: 'text.secondary'
						}}
					>
						{t('POSITION')}:
					</Typography>
					<Typography 
						variant="body2" 
						sx={{ 
							fontWeight: 500,
							fontSize: '0.875rem',
							color: 'text.primary'
						}}
					>
						{selectedTile.axialQ}, {selectedTile.axialR}
					</Typography>
				</div>
				<div className="flex justify-between">
					<Typography 
						variant="body2"
						sx={{ 
							fontSize: '0.875rem',
							color: 'text.secondary'
						}}
					>
						{t('TERRAIN')}:
					</Typography>
					<Typography 
						variant="body2" 
						sx={{ 
							fontWeight: 500,
							fontSize: '0.875rem',
							color: 'text.primary',
							textTransform: 'capitalize'
						}}
					>
						{getTerrainName(selectedTile.landType)}
					</Typography>
				</div>
				<div className="flex justify-between">
					<Typography 
						variant="body2"
						sx={{ 
							fontSize: '0.875rem',
							color: 'text.secondary'
						}}
					>
						{t('STATUS')}:
					</Typography>
					<Typography 
						variant="body2" 
						sx={{ 
							fontWeight: 500,
							fontSize: '0.875rem',
							color: selectedTile.isActive ? 'success.main' : 'error.main'
						}}
					>
						{selectedTile.isActive ? t('ACTIVE') : t('INACTIVE')}
					</Typography>
				</div>
			</div>
		</Paper>
	);
}

export default SelectedTileInfo; 