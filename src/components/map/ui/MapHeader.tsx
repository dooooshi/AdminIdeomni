import { Typography, Button } from '@mui/material';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface MapHeaderProps {
	onRefresh?: () => void;
	onSettings?: () => void;
}

function MapHeader({ onRefresh, onSettings }: MapHeaderProps) {
	const { t } = useTranslation();
	
	return (
		<div className="flex w-full container">
			<div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 p-6 md:p-8 pb-0 md:pb-0">
				<div className="flex flex-col flex-auto">
					<PageBreadcrumb className="mb-3" />
					<Typography 
						variant="h4"
						sx={{ 
							fontWeight: 500,
							fontSize: { xs: '1.75rem', sm: '2rem' },
							lineHeight: 1.2,
							color: 'text.primary',
							mb: 1
						}}
					>
						{t('map.MAP')}
					</Typography>
				</div>
				<div className="flex items-center mt-6 sm:mt-0 sm:mx-2 space-x-3">
					<Button
						variant="outlined"
						size="small"
						startIcon={<IdeomniSvgIcon size={18}>heroicons-solid:arrow-path</IdeomniSvgIcon>}
						onClick={onRefresh}
						sx={{ 
							borderColor: 'divider',
							color: 'text.secondary',
							'&:hover': {
								borderColor: 'primary.main',
								color: 'primary.main',
								backgroundColor: 'transparent'
							}
						}}
					>
						{t('map.REFRESH')}
					</Button>
					<Button
						variant="text"
						size="small"
						startIcon={<IdeomniSvgIcon size={18}>heroicons-solid:adjustments-horizontal</IdeomniSvgIcon>}
						onClick={onSettings}
						sx={{ 
							color: 'text.secondary',
							'&:hover': {
								color: 'primary.main',
								backgroundColor: 'transparent'
							}
						}}
					>
						{t('map.SETTINGS')}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default MapHeader; 