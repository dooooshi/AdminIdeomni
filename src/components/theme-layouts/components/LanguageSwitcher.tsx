import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import Link from '@ideomni/core/Link';
import { LanguageType } from '@i18n/I18nContext';
import useI18n from '@i18n/useI18n';

/**
 * The language switcher.
 */
function LanguageSwitcher() {
	const { language, languages, changeLanguage } = useI18n();

	const [menu, setMenu] = useState<null | HTMLElement>(null);

	const langMenuClick = (event: React.MouseEvent<HTMLElement>) => {
		setMenu(event.currentTarget);
	};

	const langMenuClose = () => {
		setMenu(null);
	};

	function handleLanguageChange(lng: LanguageType) {
		changeLanguage(lng.id);

		langMenuClose();
	}

	return (
		<>
			<Button
				className="border border-divider"
				onClick={langMenuClick}
			>
				<Typography
					className="mx-1 font-semibold text-md uppercase"
					sx={(theme) => ({
						color: theme.vars.palette.text.secondary,
						...theme.applyStyles('dark', {
							color: theme.vars.palette.text.primary
						})
					})}
				>
					{language.title}
				</Typography>
			</Button>
			<Popover
				open={Boolean(menu)}
				anchorEl={menu}
				onClose={langMenuClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				classes={{
					paper: 'py-2'
				}}
			>
				{languages.map((lng) => (
					<MenuItem
						key={lng.id}
						onClick={() => handleLanguageChange(lng)}
					>
						<ListItemText primary={lng.title} />
					</MenuItem>
				))}
			</Popover>
		</>
	);
}

export default LanguageSwitcher;
