import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { IdeomniThemeOption } from '@ideomni/core/IdeomniThemeSelector/ThemePreview';
import clsx from 'clsx';
import { useMainTheme } from '@ideomni/core/IdeomniSettings/hooks/IdeomniThemeHooks';
import useIdeomniSettings from '@ideomni/core/IdeomniSettings/hooks/useIdeomniSettings';
import { IdeomniSettingsConfigType } from '@ideomni/core/IdeomniSettings/IdeomniSettings';

type LightDarkModeToggleProps = {
	className?: string;
	lightTheme: IdeomniThemeOption;
	darkTheme: IdeomniThemeOption;
};

function LightDarkModeToggle(props: LightDarkModeToggleProps) {
	const { className = '', lightTheme, darkTheme } = props;
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const { setSettings } = useIdeomniSettings();
	// const { isGuest, updateUserSettings } = useUser();
	// const dispatch = useAppDispatch();

	const mainTheme = useMainTheme();

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleSelectionChange = (selection: 'light' | 'dark') => {
		if (selection === 'light') {
			handleThemeSelect(lightTheme);
		} else {
			handleThemeSelect(darkTheme);
		}

		handleClose();
	};

	async function handleThemeSelect(_theme: IdeomniThemeOption) {
		const _newSettings = setSettings({ theme: { ..._theme?.section } } as Partial<IdeomniSettingsConfigType>);

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
	}

	return (
		<>
			<IconButton
				aria-controls="light-dark-toggle-menu"
				aria-haspopup="true"
				onClick={handleClick}
				className={clsx('border border-divider', className)}
			>
				{mainTheme.palette.mode === 'light' && <IdeomniSvgIcon>heroicons-outline:sun</IdeomniSvgIcon>}
				{mainTheme.palette.mode === 'dark' && <IdeomniSvgIcon>heroicons-outline:moon</IdeomniSvgIcon>}
			</IconButton>
			<Menu
				id="light-dark-toggle-menu"
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleClose}
			>
				<MenuItem
					selected={mainTheme.palette.mode === 'light'}
					onClick={() => handleSelectionChange('light')}
				>
					Light
				</MenuItem>
				<MenuItem
					selected={mainTheme.palette.mode === 'dark'}
					onClick={() => handleSelectionChange('dark')}
				>
					Dark
				</MenuItem>
			</Menu>
		</>
	);
}

export default LightDarkModeToggle;
