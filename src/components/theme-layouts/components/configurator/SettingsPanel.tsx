import IdeomniScrollbars from '@ideomni/core/IdeomniScrollbars';
import IconButton from '@mui/material/IconButton';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import Typography from '@mui/material/Typography';
import IdeomniSettings, { IdeomniSettingsConfigType } from '@ideomni/core/IdeomniSettings/IdeomniSettings';
import IdeomniSettingsViewerDialog from 'src/components/theme-layouts/components/IdeomniSettingsViewerDialog';
import { styled, useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { SwipeableHandlers } from 'react-swipeable';
import useIdeomniSettings from '@ideomni/core/IdeomniSettings/hooks/useIdeomniSettings';

const StyledDialog = styled(Dialog)(({ theme }) => ({
	'& .MuiDialog-paper': {
		position: 'fixed',
		width: 380,
		maxWidth: '90vw',
		backgroundColor: theme.vars.palette.background.paper,
		top: 0,
		height: '100%',
		minHeight: '100%',
		bottom: 0,
		right: 0,
		margin: 0,
		zIndex: 1000,
		borderRadius: 0
	}
}));

type TransitionProps = {
	children?: React.ReactElement;
	ref?: React.RefObject<HTMLDivElement>;
};

function Transition(props: TransitionProps) {
	const { children, ref, ...other } = props;

	const theme = useTheme();

	if (!children) {
		return null;
	}

	return (
		<Slide
			direction={theme.direction === 'ltr' ? 'left' : 'right'}
			ref={ref}
			{...other}
		>
			{children}
		</Slide>
	);
}

type SettingsPanelProps = {
	settingsHandlers: SwipeableHandlers;
	onClose: () => void;
	open: boolean;
};

function SettingsPanel(props: SettingsPanelProps) {
	const { settingsHandlers, onClose, open } = props;
	// const { isGuest, updateUserSettings } = useUser();
	// const dispatch = useAppDispatch();

	const { data: settings, setSettings } = useIdeomniSettings();

	const handleSettingsChange = async (newSettings: Partial<IdeomniSettingsConfigType>) => {
		const _newSettings = setSettings(newSettings);

		/**
		 * Updating user settings disabled for demonstration purposes
		 * The request is made to the mock API and will not persist the changes
		 * You can enable it by removing the comment block below when using a real API
		 * */
		/* if (!isGuest) {
			const updatedUserData = await updateUserSettings(_newSettings);

			if (updatedUserData) {
				dispatch(showMessage({ message: 'User settings saved.' }));
			}
		} */
	};

	return (
		<StyledDialog
			TransitionComponent={Transition}
			aria-labelledby="settings-panel"
			aria-describedby="settings"
			open={open}
			onClose={onClose}
			slotProps={{
				backdrop: {
					invisible: true
				}
			}}
			disableRestoreFocus
			classes={{
				paper: 'shadow-lg'
			}}
			{...settingsHandlers}
		>
			<IdeomniScrollbars className="p-4 sm:p-6 space-y-8">
				<IconButton
					className="fixed top-0 z-10 right-0"
					onClick={onClose}
					size="large"
				>
					<IdeomniSvgIcon>heroicons-outline:x-mark</IdeomniSvgIcon>
				</IconButton>

				<Typography
					className="font-semibold"
					variant="h6"
				>
					Theme Settings
				</Typography>

				<IdeomniSettings
					value={settings}
					onChange={handleSettingsChange}
				/>

				<div className="py-8">
					<IdeomniSettingsViewerDialog />
				</div>
			</IdeomniScrollbars>
		</StyledDialog>
	);
}

export default SettingsPanel;
